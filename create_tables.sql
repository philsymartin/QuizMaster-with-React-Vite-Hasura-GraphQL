-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(255) DEFAULT 'user'
    status VARCHAR(50) DEFAULT 'inactive';
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;    

);

-- Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- Options Table
CREATE TABLE IF NOT EXISTS options (
    option_id SERIAL PRIMARY KEY,
    option_text TEXT NOT NULL
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    attempt_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    quiz_id INT REFERENCES quizzes(quiz_id),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    score DECIMAL(5,2) DEFAULT 0.0
);

-- Answers Table
CREATE TABLE IF NOT EXISTS answers (
    answer_id SERIAL PRIMARY KEY,
    attempt_id INT REFERENCES quiz_attempts(attempt_id),
    question_id INT REFERENCES questions(question_id),
    option_id INT REFERENCES options(option_id),  -- Can be NULL for text-based questions
    answer_text TEXT  -- For text-based questions
);

-- Quiz Feedback Table
CREATE TABLE IF NOT EXISTS quiz_feedback (
    feedback_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    quiz_id INT REFERENCES quizzes(quiz_id),
    feedback_text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 10),  -- Rating between 1 and 5
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
CREATE OR REPLACE FUNCTION update_total_questions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE quizzes
    SET total_questions = (
        SELECT COUNT(*)
        FROM questions
        WHERE quiz_id = NEW.quiz_id
    )
    WHERE quiz_id = NEW.quiz_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_questions
AFTER INSERT OR DELETE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_total_questions();

-- verify below 
CREATE OR REPLACE FUNCTION update_quiz_attempt_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE quiz_attempts
    SET score = (
        SELECT CAST(COUNT(*) AS DECIMAL(5,2))
        FROM answers a
        JOIN question_options qo 
            ON a.question_id = qo.question_id 
            AND a.option_id = qo.option_id
        WHERE a.attempt_id = NEW.attempt_id
        AND qo.is_correct = true
    )
    WHERE attempt_id = NEW.attempt_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update quiz attempt score
CREATE TRIGGER trigger_update_quiz_attempt_score
AFTER INSERT OR UPDATE ON answers
FOR EACH ROW
EXECUTE FUNCTION update_quiz_attempt_score();

-- 
-- 
-- till now
