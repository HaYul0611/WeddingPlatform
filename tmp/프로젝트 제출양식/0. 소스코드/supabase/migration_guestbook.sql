-- Guestbook Messages Table
CREATE TABLE IF NOT EXISTS public.guestbook_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invitation_id TEXT NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    password TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    client_id TEXT NOT NULL,
    ip_address TEXT,
    report_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banned Clients/IPs Table for Guestbook
CREATE TABLE IF NOT EXISTS public.guestbook_banned_clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id TEXT,
    ip_address TEXT,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guestbook Block Status per Invitation (Alternative to altering invitations table)
CREATE TABLE IF NOT EXISTS public.invitation_guestbook_settings (
    invitation_id TEXT PRIMARY KEY,
    is_blocked BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_guestbook_invitation_id ON public.guestbook_messages(invitation_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_banned_client_id ON public.guestbook_banned_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_banned_ip ON public.guestbook_banned_clients(ip_address);
