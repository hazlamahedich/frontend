-- Function to get token usage by model
CREATE OR REPLACE FUNCTION get_token_usage_by_model(
  user_id_param UUID,
  start_date_param TIMESTAMP WITH TIME ZONE,
  end_date_param TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  model TEXT,
  total_tokens BIGINT
)
LANGUAGE SQL
AS $$
  SELECT 
    model,
    SUM(total_tokens) as total_tokens
  FROM 
    token_usage
  WHERE 
    user_id = user_id_param
    AND timestamp >= start_date_param
    AND timestamp <= end_date_param
  GROUP BY 
    model
  ORDER BY 
    total_tokens DESC;
$$;

-- Function to get token usage by day
CREATE OR REPLACE FUNCTION get_token_usage_by_day(
  user_id_param UUID,
  start_date_param TIMESTAMP WITH TIME ZONE,
  end_date_param TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  date DATE,
  total_tokens BIGINT
)
LANGUAGE SQL
AS $$
  SELECT 
    DATE(timestamp) as date,
    SUM(total_tokens) as total_tokens
  FROM 
    token_usage
  WHERE 
    user_id = user_id_param
    AND timestamp >= start_date_param
    AND timestamp <= end_date_param
  GROUP BY 
    DATE(timestamp)
  ORDER BY 
    date;
$$;
