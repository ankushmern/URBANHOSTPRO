# 🤝 Contributing to CookMantra

Thank you for your interest in contributing to **CookMantra**! We welcome contributions from developers of all skill levels. Please take a moment to review these guidelines before submitting code.

---

## 📜 Code of Conduct

We are committed to providing an open, welcoming, and respectful environment. Please ensure all interactions are friendly, constructive, and free of harassment.

---

## 🌲 Git Branching & Workflow Strategy

1. **Fork & Clone**: Fork the repository to your GitHub account and clone locally.
2. **Branch Naming Conventions**:
   - Feature additions: `feature/short-description` (e.g., `feature/custom-chef-notes`)
   - Bug fixes: `bugfix/issue-description` (e.g., `bugfix/utr-validation-fix`)
   - Documentation updates: `docs/topic-name` (e.g., `docs/api-guide-update`)
3. **Commit Messages**: Follow standard conventional commits format:
   - `feat: add dish filter by allergen tag`
   - `fix: resolve JWT expiration handling in auth middleware`
   - `docs: update deployment environment variable list`

---

## 🛠️ Code Style & Guidelines

### TypeScript & React
- Write standard functional React components with standard hooks (`useState`, `useEffect`, `useCallback`).
- Define clear TypeScript interfaces in `/src/types.ts` for frontend data or in `/server/models` for backend entities.
- Do not use `any` types unless strictly necessary.

### Styling
- Use **Tailwind CSS v4** utility classes directly.
- Import icons exclusively from `lucide-react`.

### Backend & Express
- Validate all incoming API request payloads with **Zod** schema validators before processing business logic.
- Pass errors to the central error handling middleware using `AppError` or `asyncHandler`.

---

## 🧪 Verification Before Opening a Pull Request

Before submitting your PR, ensure that all checks pass cleanly:

```bash
# 1. Run TypeScript type checker & linter
npm run lint

# 2. Verify full-stack production compilation
npm run build
```

---

## 📬 Submitting Pull Requests

1. Push your branch to your forked GitHub repository.
2. Open a Pull Request targeting the `main` or `develop` branch of the primary repository.
3. Provide a clear description of the problem solved, changes made, and steps to test.
4. Reference any associated issue numbers in your PR body (e.g., `Closes #42`).
