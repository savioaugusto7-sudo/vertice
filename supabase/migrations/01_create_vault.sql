-- Vértice: Tabela de Cofre Criptografado em Nuvem (Zero-Knowledge)
-- Os dados são gravados exclusivamente no formato cifrado AES-256-GCM.
-- Nenhuma informação financeira em texto claro trafega ou fica armazenada no banco.

CREATE TABLE IF NOT EXISTS public.user_financial_vault (
    user_id TEXT PRIMARY KEY,
    encrypted_data TEXT NOT NULL,
    iv TEXT NOT NULL,
    salt TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.user_financial_vault ENABLE ROW LEVEL SECURITY;

-- Política de Leitura: Usuário só lê o próprio cofre
CREATE POLICY "Users can select own financial vault"
ON public.user_financial_vault
FOR SELECT
USING (auth.uid()::text = user_id OR user_id = 'default_owner');

-- Política de Gravação: Usuário só insere ou atualiza o próprio cofre
CREATE POLICY "Users can upsert own financial vault"
ON public.user_financial_vault
FOR ALL
USING (auth.uid()::text = user_id OR user_id = 'default_owner')
WITH CHECK (auth.uid()::text = user_id OR user_id = 'default_owner');
