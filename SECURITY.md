# Security Implementation Guide

This document outlines the security measures implemented in the MediLink application to protect against common web vulnerabilities.

## 🛡️ Implemented Security Measures

### 1. Cross-Site Scripting (XSS) Protection

#### SafeHtml Component
- **Location**: `src/components/SafeHtml.tsx`
- **Purpose**: Sanitizes user-generated HTML content before rendering
- **Technology**: DOMPurify library
- **Usage**:
```tsx
import SafeHtml from '@/components/SafeHtml';

<SafeHtml html={userGeneratedContent} className="content" />
```

#### Best Practices
- Never use `dangerouslySetInnerHTML` without sanitization
- All user inputs are escaped by default in React
- File uploads are validated for type and size
- No inline event handlers allowed (onClick, onLoad, etc.)

### 2. Cross-Site Request Forgery (CSRF) Protection

#### CSRF Token Implementation
- **Location**: `src/lib/csrf.ts`
- **Pattern**: Double-submit cookie pattern
- **Token Storage**: SessionStorage (cleared on browser close)
- **Header Name**: `X-CSRF-Token`

#### How It Works
1. Token generated on first request or after login
2. Token included in headers for POST, PUT, DELETE, PATCH requests
3. Token refreshed after login/registration
4. Token cleared on logout

#### Implementation in API Client
```typescript
import { addCsrfHeader } from './csrf';

// Automatically adds CSRF token to state-changing requests
headers = addCsrfHeader(headers);
```

### 3. Input Validation & Sanitization

#### Validation Schemas
- **Location**: `src/lib/validation.ts`
- **Technology**: Zod schema validation
- **Coverage**:
  - Login credentials
  - Registration data
  - Profile updates
  - Password changes
  - Search queries
  - File uploads

#### Validation Features
- **Email**: Format validation, length limits, lowercase conversion
- **Passwords**: 
  - Minimum 8 characters
  - Must contain uppercase, lowercase, and numbers
  - Maximum length to prevent DoS
- **Names**: Alphanumeric + allowed special characters only
- **Phone**: Format validation with regex
- **File Uploads**: Type and size validation

#### Usage Example
```typescript
import { loginSchema } from '@/lib/validation';

const validatedData = loginSchema.parse(formData);
```

### 4. Authentication Security

#### Token Management
- JWT tokens stored in localStorage
- Tokens included in Authorization header
- CSRF tokens in sessionStorage (auto-cleared)
- Logout clears all tokens

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Protected from brute force with rate limiting (backend)

### 5. API Security

#### Headers
- `Content-Type`: application/json
- `Accept`: application/json
- `Authorization`: Bearer token
- `X-CSRF-Token`: CSRF protection

#### Request Security
- CORS enabled with specific origin
- Credentials handling: omit (no cookies)
- All user inputs sanitized before API calls
- URL parameters properly encoded

### 6. File Upload Security

#### Validation
```typescript
validateFileUpload(file, ['image/jpeg', 'image/png', 'application/pdf'], 5);
```

- Allowed file types specified
- Maximum file size enforced (5MB default for images, 10MB for PDFs)
- File name length validation
- Content-Type verification

### 7. Additional Security Measures

#### Input Sanitization Utilities
- `sanitizeSearchQuery()`: Removes HTML tags, limits special characters
- `sanitizeUrlParam()`: Encodes URL parameters
- `sanitizeTextInput()`: Generic text sanitization

#### Prevention of Common Attacks
- **SQL Injection**: Backend uses parameterized queries
- **NoSQL Injection**: Input validation prevents malicious queries
- **Path Traversal**: File paths validated and sanitized
- **Command Injection**: No shell commands executed with user input

## 🚀 Usage Guidelines

### For Forms
1. Always validate on client-side AND server-side
2. Use zod schemas for all form inputs
3. Display user-friendly error messages
4. Never log sensitive data to console

### For User-Generated Content
1. Use SafeHtml component for rendering HTML
2. Sanitize all text inputs
3. Validate file uploads before processing
4. Escape special characters in search queries

### For API Calls
1. CSRF tokens automatically added
2. Always use apiClient methods
3. Handle errors gracefully
4. Never expose tokens in URLs

## 📋 Security Checklist

- ✅ XSS Protection (DOMPurify + React escaping)
- ✅ CSRF Protection (Token-based)
- ✅ Input Validation (Zod schemas)
- ✅ Password Security (Strong requirements)
- ✅ File Upload Validation
- ✅ Authentication Token Management
- ✅ API Security Headers
- ✅ SQL/NoSQL Injection Prevention
- ✅ Secure Error Handling

## 🔍 Testing Security

### Manual Testing
1. Try submitting forms with HTML/JavaScript in inputs
2. Attempt to upload invalid file types
3. Test password requirements
4. Verify CSRF protection on state-changing operations

### Automated Testing (Recommended)
- Use OWASP ZAP for vulnerability scanning
- Test with malicious payloads
- Verify all validation rules

## 📝 Maintenance

### Regular Updates
- Keep dependencies updated (especially security-related)
- Review DOMPurify configuration
- Update validation rules as needed
- Monitor security advisories

### Code Review Checklist
- [ ] All user inputs validated
- [ ] HTML content sanitized
- [ ] File uploads validated
- [ ] Passwords meet requirements
- [ ] CSRF tokens on state changes
- [ ] No sensitive data in console logs
- [ ] Error messages don't leak information

## 🆘 Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** create a public issue
2. Contact security team directly
3. Provide detailed information
4. Allow time for fix before disclosure

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/keeping-components-pure)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Zod Documentation](https://zod.dev/)
