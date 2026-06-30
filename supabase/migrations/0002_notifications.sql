-- supabase/migrations/0002_notifications.sql
-- Notification schema support: fb_psid, logs, and trigger callbacks.

-- A. Add Facebook PSID to profiles
ALTER TABLE profiles ADD COLUMN fb_psid TEXT NULL;

-- B. Create notification_log table
CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'messenger')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    provider_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS on notification_log
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Admins and staff can view notification logs
CREATE POLICY "Admins/Staff view logs" ON notification_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Enable pg_net extension if not already present
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- C. Trigger Function to invoke notify-instructor Edge Function asynchronously
CREATE OR REPLACE FUNCTION trigger_notify_instructor()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if booking is confirmed (or upcoming)
    IF NEW.status IN ('upcoming', 'confirmed') THEN
        IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
            BEGIN
                -- Perform HTTP post to Edge Function
                PERFORM net.http_post(
                    url := 'http://kong:8000/functions/v1/notify-instructor',
                    headers := jsonb_build_object(
                        'Content-Type', 'application/json'
                    ),
                    body := jsonb_build_object('booking_id', NEW.id)
                );
            EXCEPTION WHEN OTHERS THEN
                -- Failure isolation: log trigger error but don't fail the transaction
                INSERT INTO notification_log (booking_id, channel, status, provider_response)
                VALUES (
                    NEW.id, 
                    'email', 
                    'failed', 
                    'Database HTTP trigger error: ' || SQLERRM
                );
            END;
        ELSE
            -- Log warning that pg_net is missing
            INSERT INTO notification_log (booking_id, channel, status, provider_response)
            VALUES (
                NEW.id, 
                'email', 
                'failed', 
                'pg_net extension not enabled in this database instance.'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Register trigger on bookings table
CREATE TRIGGER trigger_booking_confirmed_notify
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION trigger_notify_instructor();
