# Git Workflow ve Branch Stratejisi

## Branch Stratejisi

### Ana Branch'ler

- **main**: Prodüksiyon-ready kod. Sadece release'ler için kullanılır.
- **develop**: Geliştirme branch'i. Tüm feature'lar burada birleştirilir.

### Destek Branch'leri

- **feature/**: Yeni özellik geliştirme
- **bugfix/**: Bug düzeltmeleri
- **hotfix/**: Acil prodüksiyon düzeltmeleri
- **release/**: Release hazırlığı

## Branch Naming Convention

```
feature/DOC-123-user-authentication
bugfix/DOC-456-fix-login-error
hotfix/DOC-789-critical-security-fix
release/v1.2.0
```

## Workflow Adımları

### 1. Feature Geliştirme

```bash
# Develop'dan yeni feature branch oluştur
git checkout develop
git pull origin develop
git checkout -b feature/DOC-123-impact-analysis

# Geliştirme yap
git add .
git commit -m "feat: add impact analysis algorithm"

# Push ve PR oluştur
git push origin feature/DOC-123-impact-analysis
```

### 2. Code Review Süreci

- Tüm PR'lar en az 1 reviewer tarafından onaylanmalı
- Automated tests geçmeli
- Code coverage %80 üzerinde olmalı
- Linting ve formatting kontrolleri geçmeli

### 3. Merge Stratejisi

- Feature → Develop: Squash and merge
- Develop → Main: Merge commit (release için)
- Hotfix → Main: Merge commit

## Commit Message Formatı

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

- **feat**: Yeni özellik
- **fix**: Bug düzeltmesi
- **docs**: Dokümantasyon değişikliği
- **style**: Kod formatı değişikliği
- **refactor**: Kod refactoring
- **test**: Test ekleme/düzeltme
- **chore**: Build/config değişiklikleri

### Örnekler

```
feat(auth): add JWT token refresh mechanism
fix(api): resolve user role validation error
docs(readme): update installation instructions
refactor(utils): optimize impact analysis algorithm
```

## Release Süreci

### 1. Release Branch Oluşturma

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0
```

### 2. Release Hazırlığı

- Version numaralarını güncelle
- CHANGELOG.md dosyasını güncelle
- Son testleri çalıştır
- Dokümantasyonu güncelle

### 3. Release Tamamlama

```bash
# Main'e merge
git checkout main
git merge release/v1.2.0
git tag v1.2.0

# Develop'a geri merge
git checkout develop
git merge release/v1.2.0

# Release branch'i sil
git branch -d release/v1.2.0
```

## Hotfix Süreci

```bash
# Main'den hotfix branch oluştur
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.1-security-fix

# Düzeltmeyi yap
git add .
git commit -m "fix: resolve critical security vulnerability"

# Main'e merge
git checkout main
git merge hotfix/v1.2.1-security-fix
git tag v1.2.1

# Develop'a da merge
git checkout develop
git merge hotfix/v1.2.1-security-fix
```

## Branch Protection Rules

### Main Branch
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes that create files larger than 100MB

### Develop Branch
- Require pull request reviews
- Require status checks to pass
- Allow force pushes (sadece maintainer'lar için)

## Automated Checks

### Pre-commit Hooks
- ESLint kontrolü
- Prettier formatting
- TypeScript type checking
- Unit test çalıştırma

### CI/CD Pipeline
- Automated testing
- Code coverage raporu
- Security scanning
- Build verification