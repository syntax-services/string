-- Add IDIC tournament columns to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS idic_department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS idic_code TEXT UNIQUE;

-- Create Teams table
CREATE TABLE IF NOT EXISTS public.idic_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    group_name CHAR(1) NOT NULL CHECK (group_name IN ('A', 'B', 'C', 'D')),
    played INTEGER NOT NULL DEFAULT 0,
    won INTEGER NOT NULL DEFAULT 0,
    drawn INTEGER NOT NULL DEFAULT 0,
    lost INTEGER NOT NULL DEFAULT 0,
    goals_for INTEGER NOT NULL DEFAULT 0,
    goals_against INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Matches table
CREATE TABLE IF NOT EXISTS public.idic_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round TEXT NOT NULL CHECK (round IN ('Group', 'Quarter', 'Semi', 'ThirdPlace', 'Final')),
    group_name CHAR(1) CHECK (group_name IN ('A', 'B', 'C', 'D')),
    team_a_id UUID REFERENCES public.idic_teams(id) ON DELETE CASCADE,
    team_b_id UUID REFERENCES public.idic_teams(id) ON DELETE CASCADE,
    team_a_score INTEGER DEFAULT NULL,
    team_b_score INTEGER DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
    match_time TIMESTAMPTZ,
    pitch TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.idic_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idic_matches ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies
DROP POLICY IF EXISTS "Anyone can view IDIC teams" ON public.idic_teams;
CREATE POLICY "Anyone can view IDIC teams" ON public.idic_teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage IDIC teams" ON public.idic_teams;
CREATE POLICY "Admins can manage IDIC teams" ON public.idic_teams FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can view IDIC matches" ON public.idic_matches;
CREATE POLICY "Anyone can view IDIC matches" ON public.idic_matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage IDIC matches" ON public.idic_matches;
CREATE POLICY "Admins can manage IDIC matches" ON public.idic_matches FOR ALL 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger function to recalculate team standings based on completed matches
CREATE OR REPLACE FUNCTION public.recalculate_idic_standings() 
RETURNS TRIGGER AS $$
BEGIN
    -- Reset stats for all teams involved in this update/insert/delete
    UPDATE public.idic_teams 
    SET played = 0, won = 0, drawn = 0, lost = 0, goals_for = 0, goals_against = 0, points = 0;

    -- Recalculate stats for Team A for all completed matches
    UPDATE public.idic_teams t
    SET 
        played = COALESCE((SELECT COUNT(*) FROM public.idic_matches m WHERE (m.team_a_id = t.id OR m.team_b_id = t.id) AND m.status = 'completed'), 0),
        
        won = COALESCE(
            (SELECT COUNT(*) FROM public.idic_matches m WHERE 
                ((m.team_a_id = t.id AND m.team_a_score > m.team_b_score) OR 
                 (m.team_b_id = t.id AND m.team_b_score > m.team_a_score)) AND m.status = 'completed'
            ), 0
        ),
        
        drawn = COALESCE(
            (SELECT COUNT(*) FROM public.idic_matches m WHERE 
                (m.team_a_id = t.id OR m.team_b_id = t.id) AND m.team_a_score = m.team_b_score AND m.status = 'completed'
            ), 0
        ),
        
        lost = COALESCE(
            (SELECT COUNT(*) FROM public.idic_matches m WHERE 
                ((m.team_a_id = t.id AND m.team_a_score < m.team_b_score) OR 
                 (m.team_b_id = t.id AND m.team_b_score < m.team_a_score)) AND m.status = 'completed'
            ), 0
        ),
        
        goals_for = COALESCE(
            (SELECT SUM(CASE WHEN m.team_a_id = t.id THEN m.team_a_score ELSE m.team_b_score END) 
             FROM public.idic_matches m WHERE (m.team_a_id = t.id OR m.team_b_id = t.id) AND m.status = 'completed'), 0
        ),
        
        goals_against = COALESCE(
            (SELECT SUM(CASE WHEN m.team_a_id = t.id THEN m.team_b_score ELSE m.team_a_score END) 
             FROM public.idic_matches m WHERE (m.team_a_id = t.id OR m.team_b_id = t.id) AND m.status = 'completed'), 0
        ),
        
        points = COALESCE(
            (SELECT SUM(
                CASE 
                    -- Won match (3 points)
                    WHEN (m.team_a_id = t.id AND m.team_a_score > m.team_b_score) OR (m.team_b_id = t.id AND m.team_b_score > m.team_a_score) THEN 3
                    -- Drawn match (1 point)
                    WHEN m.team_a_score = m.team_b_score THEN 1
                    -- Lost match (0 points)
                    ELSE 0
                END
             ) FROM public.idic_matches m WHERE (m.team_a_id = t.id OR m.team_b_id = t.id) AND m.status = 'completed'), 0
        );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate standings on match updates
DROP TRIGGER IF EXISTS trg_recalculate_idic_standings ON public.idic_matches;
CREATE TRIGGER trg_recalculate_idic_standings 
AFTER INSERT OR UPDATE OR DELETE ON public.idic_matches 
FOR EACH STATEMENT EXECUTE FUNCTION public.recalculate_idic_standings();

-- Seed Initial Departments
INSERT INTO public.idic_teams (name, group_name) VALUES
-- Group A
('Computer Science', 'A'),
('Mathematics', 'A'),
('Statistics', 'A'),
('Physics', 'A'),
('Chemistry', 'A'),
-- Group B
('Medicine', 'B'),
('Pharmacy', 'B'),
('Nursing', 'B'),
('Biochemistry', 'B'),
('Microbiology', 'B'),
-- Group C
('Law', 'C'),
('Political Science', 'C'),
('Sociology', 'C'),
('Economics', 'C'),
('Mass Communication', 'C'),
-- Group D
('Mechanical Engineering', 'D'),
('Electrical Engineering', 'D'),
('Civil Engineering', 'D'),
('Chemical Engineering', 'D'),
('Business Administration', 'D')
ON CONFLICT (name) DO NOTHING;
