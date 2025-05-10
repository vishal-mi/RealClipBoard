-- Create clips table
CREATE TABLE public.clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clip_items table
CREATE TABLE public.clip_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clip_id UUID NOT NULL REFERENCES public.clips(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 20),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (clip_id, position)
);

-- Create index for faster lookups
CREATE INDEX clip_items_clip_id_idx ON public.clip_items(clip_id);

-- Create a stored procedure to save a clip with its items in a transaction
CREATE OR REPLACE FUNCTION public.save_clip(
    p_clip_name TEXT,
    p_clip_items JSONB
) RETURNS VOID AS $$
DECLARE
    v_clip_id UUID;
    v_item JSONB;
BEGIN
    -- Check if clip exists
    SELECT id INTO v_clip_id FROM public.clips WHERE name = p_clip_name;
    
    IF v_clip_id IS NULL THEN
        -- Create new clip
        INSERT INTO public.clips (name) 
        VALUES (p_clip_name)
        RETURNING id INTO v_clip_id;
    ELSE
        -- Update existing clip's timestamp
        UPDATE public.clips 
        SET updated_at = NOW() 
        WHERE id = v_clip_id;
        
        -- Delete existing items
        DELETE FROM public.clip_items 
        WHERE clip_id = v_clip_id;
    END IF;
    
    -- Insert new items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_clip_items)
    LOOP
        -- Only insert non-empty items to save space
        IF v_item->>'content' IS NOT NULL AND (v_item->>'content')::TEXT <> '' THEN
            INSERT INTO public.clip_items (
                clip_id, 
                position, 
                content
            ) VALUES (
                v_clip_id,
                (v_item->>'position')::INTEGER,
                (v_item->>'content')::TEXT
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for future user authentication
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clip_items ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (you'll want to change this when adding auth)
CREATE POLICY "Public clips access" ON public.clips
    FOR ALL USING (true);

CREATE POLICY "Public clip_items access" ON public.clip_items
    FOR ALL USING (true);