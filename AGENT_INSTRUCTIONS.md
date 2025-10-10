# Agent Instructions - YT Dubber Project

## 🎯 **Default Branch: `backend-2024-10-10`**

This repository is configured for backend development. When you clone this repository, you'll automatically be on the `backend-2024-10-10` branch.

## 🚀 **Quick Start for New Agents**

### **1. Clone and Setup**
```bash
git clone https://github.com/iudofia2026/youtubedubber.com.git
cd youtubedubber.com
# You'll automatically be on backend-2024-10-10 branch
```

### **2. Verify Branch**
```bash
git branch
# Should show: * backend-2024-10-10
```

### **3. Start Development**
```bash
# Frontend development
cd frontend
npm install
npm run dev

# Backend development (when ready)
cd backend
# Follow CLI_DEVELOPMENT_GUIDE.md
```

## 📋 **Branch Strategy**

### **Main Branch (`main`)**
- **Purpose**: Production-ready frontend code
- **Status**: Clean, stable frontend only
- **Usage**: For production deployments

### **Backend Branch (`backend-2024-10-10`)**
- **Purpose**: All backend development work
- **Status**: Active development branch
- **Usage**: All new features, fixes, and backend work

### **Feature Branches**
- **Create from**: `backend-2024-10-10` (not from main)
- **Naming**: `feature/description` or `fix/description`
- **Merge to**: `backend-2024-10-10`

## 🛠️ **Development Workflow**

### **For Backend Work:**
1. Ensure you're on `backend-2024-10-10`
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and commit
4. Push to your feature branch
5. Create PR to `backend-2024-10-10`

### **For Frontend Work:**
1. Work directly on `backend-2024-10-10` (frontend is stable)
2. Or create feature branch if major changes
3. All frontend work stays in the backend branch

## 📚 **Documentation**

- **Frontend Setup**: `frontend/README.md`
- **Backend Development**: `backend/CLI_DEVELOPMENT_GUIDE.md`
- **Backend Architecture**: `backend/DEV_PLAN.md`
- **Project Overview**: `README.md`

## ⚠️ **Important Notes**

- **DO NOT** push directly to `main` branch
- **DO NOT** create branches from `main` for backend work
- **ALWAYS** work from `backend-2024-10-10` for new development
- **VERIFY** your branch before starting work: `git branch`

## 🔄 **Branch Management**

### **Check Current Branch**
```bash
git branch
git status
```

### **Switch to Backend Branch**
```bash
git checkout backend-2024-10-10
```

### **Create Feature Branch**
```bash
git checkout backend-2024-10-10
git checkout -b feature/your-feature-name
```

### **Push Changes**
```bash
git push -u origin feature/your-feature-name
```

## 🎯 **Current Project Status**

- **Frontend**: Complete and stable
- **Backend**: Ready for development
- **Documentation**: Comprehensive CLI guides available
- **Environment**: Configured for CLI-based development

## 🚨 **Emergency Procedures**

### **If You Accidentally Work on Main:**
```bash
git checkout main
git checkout -b feature/your-work
git add .
git commit -m "Move work to feature branch"
git push -u origin feature/your-work
# Then merge to backend-2024-10-10
```

### **If You Need to Reset:**
```bash
git checkout backend-2024-10-10
git pull origin backend-2024-10-10
```

---

**Remember**: All development work should happen in the `backend-2024-10-10` branch or feature branches created from it. The `main` branch is kept clean for production releases.