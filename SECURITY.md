# LipaSasa Security Implementation Guide

## ✅ Implemented Security Measures

### 1. **Row-Level Security (RLS)**
All database tables have RLS policies enabled:
- Users can only access their own data
- Admin users have elevated permissions via role-based access control
- Separate `user_roles` table prevents privilege escalation attacks

### 2. **Role-Based Access Control (RBAC)**
- Created `app_role` enum with three levels: `admin`, `merchant`, `user`
- Implemented `user_roles` table (separate from profiles) to prevent attacks
- Security definer function `has_role()` prevents RLS recursion
- All new users are assigned `merchant` role by default

### 3. **Input Validation**
Comprehensive Zod schemas for all forms:
- Phone number validation (Kenyan 254 format)
- Invoice creation validation (name, email, amount limits)
- M-PESA credentials validation (format checks)
- Payment input validation
- Profile update validation
- All inputs are trimmed and have max length constraints

### 4. **Edge Function Security**
- **mpesa-stk-push**: JWT verification enabled (requires authentication)
- **mpesa-callback**: JWT verification disabled (public webhook)
- Request origin logging for webhook monitoring
- Proper error handling without exposing sensitive data

### 5. **API Security Best Practices**
- No hardcoded credentials in code
- Environment variables for sensitive data
- CORS headers properly configured
- Idempotency checks in webhook handlers

---

## ⚠️ Security Tasks Requiring User Action

### 1. **Fix Supabase Auth Security Warnings**

#### a) Update OTP Expiry Settings
- **Action**: Go to [Auth Settings](https://supabase.com/dashboard/project/qafcuihpszmexfpxnyax/settings/auth)
- **Task**: Reduce OTP expiry time to recommended threshold
- **Docs**: https://supabase.com/docs/guides/platform/going-into-prod#security

#### b) Enable Leaked Password Protection
- **Action**: Go to [Auth Settings](https://supabase.com/dashboard/project/qafcuihpszmexfpxnyax/settings/auth)
- **Task**: Enable leaked password protection
- **Docs**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

#### c) Upgrade Postgres Version
- **Action**: Go to [Infrastructure Settings](https://supabase.com/dashboard/project/qafcuihpszmexfpxnyax/settings/infrastructure)
- **Task**: Upgrade to latest Postgres version for security patches
- **Docs**: https://supabase.com/docs/guides/platform/upgrading

### 2. **Seed Initial Admin User**
To create your first admin user:

```sql
-- Replace <admin_user_id> with your actual user ID
INSERT INTO public.user_roles (user_id, role) 
VALUES ('<admin_user_id>', 'admin');
```

Run this in the [SQL Editor](https://supabase.com/dashboard/project/qafcuihpszmexfpxnyax/sql/new).

### 3. **M-PESA Webhook IP Whitelist (Production)**
For production, implement IP whitelisting for Safaricom callback IPs:

**Safaricom Production IPs** (verify with Safaricom):
- Add these IPs to your edge function validation
- Update `mpesa-callback/index.ts` to check request origin

Example:
```typescript
const ALLOWED_IPS = [
  '196.201.214.200', // Safaricom IP (example - verify actual IPs)
  '196.201.214.206',
  '196.201.213.114',
];

const clientIp = req.headers.get('x-forwarded-for');
if (!ALLOWED_IPS.includes(clientIp)) {
  return new Response('Unauthorized', { status: 403 });
}
```

### 4. **Encrypt M-PESA Credentials (Recommended)**
Currently, M-PESA credentials are stored in plain text. For production:

#### Option 1: Use Supabase Vault (Recommended)
```sql
-- Enable the vault extension
CREATE EXTENSION IF NOT EXISTS vault;

-- Store credentials in vault
SELECT vault.create_secret('mpesa_consumer_key');
SELECT vault.create_secret('mpesa_consumer_secret');
SELECT vault.create_secret('mpesa_passkey');
```

#### Option 2: Use pgcrypto
```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Modify table to use encrypted columns
ALTER TABLE mpesa_credentials 
  ALTER COLUMN consumer_key TYPE bytea USING pgp_sym_encrypt(consumer_key, '<encryption_key>'),
  ALTER COLUMN consumer_secret TYPE bytea USING pgp_sym_encrypt(consumer_secret, '<encryption_key>'),
  ALTER COLUMN passkey TYPE bytea USING pgp_sym_encrypt(passkey, '<encryption_key>');
```

---

## 🔒 Additional Production Recommendations

### 1. **Rate Limiting**
Implement rate limiting on edge functions to prevent abuse:
- Configure in Supabase Edge Function settings
- Limit requests per IP/user
- Especially important for payment endpoints

### 2. **Audit Logging**
Consider adding audit logs for:
- Payment transactions
- Admin actions
- Credential changes
- Failed authentication attempts

### 3. **Environment Separation**
- Use Safaricom Sandbox for development/testing
- Use Safaricom Production API only in production
- Separate Supabase projects for dev/staging/production

### 4. **Regular Security Audits**
- Review RLS policies quarterly
- Update dependencies regularly
- Monitor Supabase security advisories
- Review edge function logs for suspicious activity

### 5. **Backup Strategy**
- Enable Supabase automated backups
- Regular database exports
- Secure backup storage
- Test restoration procedures

---

## 📋 Security Checklist for Production

- [ ] All auth security warnings resolved
- [ ] Admin user seeded
- [ ] M-PESA credentials encrypted
- [ ] Webhook IP whitelist implemented
- [ ] Rate limiting configured
- [ ] SSL/TLS certificates validated
- [ ] Environment variables secured
- [ ] Backup strategy implemented
- [ ] Security audit completed
- [ ] Incident response plan documented

---

## 🚨 Security Incident Response

If you suspect a security breach:

1. **Immediate Actions**:
   - Rotate all API keys and secrets
   - Review recent transactions
   - Check edge function logs
   - Disable compromised credentials

2. **Investigation**:
   - Review audit logs
   - Check for unauthorized access
   - Identify attack vector
   - Document findings

3. **Recovery**:
   - Patch vulnerabilities
   - Restore from backups if needed
   - Notify affected users
   - Update security measures

4. **Post-Incident**:
   - Update security documentation
   - Improve monitoring
   - Train team on lessons learned

---

## 📚 Security Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Safaricom Daraja Security Guidelines](https://developer.safaricom.co.ke/)
- [Database Security Checklist](https://supabase.com/docs/guides/database/securing-your-database)

---

**Last Updated**: 2025-10-03  
**Review Frequency**: Quarterly
