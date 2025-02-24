-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(255) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'inactive' check (status IN ('active','inactive','deleted','banned')),
    last_active TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    difficulty VARCHAR(50) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    time_limit_minutes INT NOT NULL DEFAULT 30,
    total_questions INT DEFAULT 0,
    participants_count INT DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    question_id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES quizzes(quiz_id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) CHECK (question_type IN ('multiple_choice', 'true_false', 'text')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
);

-- Options Table
CREATE TABLE IF NOT EXISTS options (
    option_id SERIAL PRIMARY KEY,
    option_text TEXT NOT NULL UNIQUE
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    attempt_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    quiz_id INT REFERENCES quizzes(quiz_id),
    start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMPTZ,
    score DECIMAL(5,2) DEFAULT 0.0
);

-- Answers Table
CREATE TABLE IF NOT EXISTS answers (
    answer_id SERIAL PRIMARY KEY,
    attempt_id INT REFERENCES quiz_attempts(attempt_id),
    question_id INT REFERENCES questions(question_id),
    option_id INT REFERENCES options(option_id),  
    answer_text TEXT  -- For text-based questions
);

-- Quiz Feedback Table
CREATE TABLE IF NOT EXISTS quiz_feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    quiz_id INT REFERENCES quizzes(quiz_id),
    feedback_text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 10),  
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    sentiment_label VARCHAR(50),
    sentiment_score DECIMAL(5,4),
    analyzed_at TIMESTAMPTZ;
);

-- User Performance Table
CREATE TABLE IF NOT EXISTS user_performance (
    performance_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    quiz_id INT REFERENCES quizzes(quiz_id),
    total_attempts INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.0
);


CREATE TABLE IF NOT EXISTS topics (
    topic_id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL UNIQUE
);

-- Quiz Topics Junction Table
CREATE TABLE IF NOT EXISTS quiz_topics (
    quiz_id INT REFERENCES quizzes(quiz_id),
    topic_id INT REFERENCES topics(topic_id),
    PRIMARY KEY (quiz_id, topic_id)
);
CREATE TABLE IF NOT EXISTS question_options (
    question_id INT REFERENCES questions(question_id),
    option_id INT REFERENCES options(option_id),
    is_correct BOOLEAN DEFAULT false,
    PRIMARY KEY (question_id, option_id)
);
-- Create table for feedback keywords
CREATE TABLE IF NOT EXISTS feedback_keywords (
    keyword_id SERIAL PRIMARY KEY,
    keyword TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Create junction table for feedback-keyword relationship
CREATE TABLE IF NOT EXISTS feedback_keyword_mapping (
    feedback_id INT REFERENCES quiz_feedback(feedback_id),
    keyword_id INT REFERENCES feedback_keywords(keyword_id),
    sentiment_context DECIMAL(5,4),  -- Sentiment score for this keyword in this context
    PRIMARY KEY (feedback_id, keyword_id)
);
-- Create table for keyword analytics
CREATE TABLE IF NOT EXISTS keyword_analytics (
    keyword_id INT REFERENCES feedback_keywords(keyword_id),
    quiz_id INT REFERENCES quizzes(quiz_id),
    occurrence_count INT DEFAULT 1,
    average_sentiment DECIMAL(5,4),
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (keyword_id, quiz_id)
);


-- Indexes for Optimization
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_questions_quiz_id ON questions (quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts (user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts (quiz_id);
CREATE INDEX idx_user_performance_user_id ON user_performance (user_id);
CREATE INDEX idx_user_performance_quiz_id ON user_performance (quiz_id);

-- Indexes for new columns
CREATE INDEX idx_quizzes_difficulty ON quizzes (difficulty);
CREATE INDEX idx_quiz_topics_quiz_id ON quiz_topics (quiz_id);
CREATE INDEX idx_quiz_topics_topic_id ON quiz_topics (topic_id);

-- Trigger to update participants count in quizzes table
CREATE OR REPLACE FUNCTION update_participants_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE quizzes
    SET participants_count = (
        SELECT COUNT(DISTINCT user_id)
        FROM quiz_attempts
        WHERE quiz_id = NEW.quiz_id
    )
    WHERE quiz_id = NEW.quiz_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participants_count
AFTER INSERT ON quiz_attempts
FOR EACH ROW
EXECUTE FUNCTION update_participants_count();

-- Trigger to update average rating of a quiz
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE quizzes
    SET average_rating = (
        SELECT AVG(rating)::DECIMAL(3,2)
        FROM quiz_feedback
        WHERE quiz_id = NEW.quiz_id
    )
    WHERE quiz_id = NEW.quiz_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_average_rating
AFTER INSERT OR UPDATE ON quiz_feedback
FOR EACH ROW
EXECUTE FUNCTION update_average_rating();

-- Trigger to update total questions count in quizzes table
CREATE OR REPLACE FUNCTION public.update_total_questions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE quizzes
        SET total_questions = (
            SELECT COUNT(*)
            FROM questions
            WHERE quiz_id = NEW.quiz_id
        )
        WHERE quiz_id = NEW.quiz_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE quizzes
        SET total_questions = (
            SELECT COUNT(*)
            FROM questions
            WHERE quiz_id = OLD.quiz_id
        )
        WHERE quiz_id = OLD.quiz_id;
        RETURN OLD;
    END IF;
END;
$function$

CREATE TRIGGER trigger_update_total_questions
AFTER INSERT OR DELETE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_total_questions();

-- Create or replace function to update keyword analytics
CREATE OR REPLACE FUNCTION update_keyword_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert into keyword_analytics
    INSERT INTO keyword_analytics (keyword_id, quiz_id, occurrence_count, average_sentiment)
    SELECT 
        NEW.keyword_id,
        qf.quiz_id,
        COUNT(*),
        AVG(fkm.sentiment_context)
    FROM quiz_feedback qf
    JOIN feedback_keyword_mapping fkm ON qf.feedback_id = fkm.feedback_id
    WHERE fkm.keyword_id = NEW.keyword_id
    GROUP BY qf.quiz_id
    ON CONFLICT (keyword_id, quiz_id) 
    DO UPDATE SET
        occurrence_count = EXCLUDED.occurrence_count,
        average_sentiment = EXCLUDED.average_sentiment,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for keyword analytics
CREATE TRIGGER trigger_update_keyword_analytics
AFTER INSERT OR UPDATE ON feedback_keyword_mapping
FOR EACH ROW
EXECUTE FUNCTION update_keyword_analytics();

-- Create function for the trigger
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changes from 'active' to something else OR changes to 'active' from something else
    IF (OLD.status = 'active' AND NEW.status != 'active') OR 
       (OLD.status != 'active' AND NEW.status = 'active') THEN
        NEW.last_active = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_last_active
BEFORE UPDATE ON users
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_last_active();

-- Create a trigger function to update analyzed_at timestamp
CREATE OR REPLACE FUNCTION update_sentiment_analyzed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update analyzed_at if sentiment data is being updated
    IF (NEW.sentiment_label IS DISTINCT FROM OLD.sentiment_label) OR 
       (NEW.sentiment_score IS DISTINCT FROM OLD.sentiment_score) THEN
        NEW.analyzed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_sentiment_analyzed_at
BEFORE UPDATE ON quiz_feedback
FOR EACH ROW
EXECUTE FUNCTION update_sentiment_analyzed_at();
