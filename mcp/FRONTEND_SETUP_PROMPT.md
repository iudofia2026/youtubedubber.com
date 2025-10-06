# YouTube Multilingual Dubber - Frontend Setup Prompt

## Project Overview
Create a minimal Next.js 14 + Tailwind + TypeScript frontend for "YouTube Multilingual Dubber" - a web app that allows users to upload voice and background audio tracks, select target languages, and submit for processing.

## MCP Server Integration
**IMPORTANT**: This project should leverage the deliberate-thinking MCP server for complex problem-solving and planning. Use the `deliberatethinking` tool for:
- Breaking down complex UI/UX decisions
- Planning component architecture
- Analyzing user flow requirements
- Problem-solving during development
- Making design system decisions

The MCP server is already configured and available in this workspace.

## Technical Requirements

### Core Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (for subtle animations)
- **shadcn/ui** (for UI components)

### Design System
- **Sharp, geometric, minimalist** design
- **Modern, premium-feeling** UI
- **No glass effects or rounded corners**
- **Clean, professional aesthetic**
- **Subtle motion** with Framer Motion

## Project Structure
```
yt-multilang-dubber/
├── app/
│   ├── page.tsx                 # Home page
│   ├── new/
│   │   └── page.tsx            # Upload form page
│   ├── jobs/
│   │   └── [id]/
│   │       └── page.tsx        # Job status page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── FileUpload.tsx          # File upload component
│   ├── LanguageSelect.tsx      # Language selection
│   ├── ProgressBar.tsx         # Job progress indicator
│   └── Navigation.tsx          # Site navigation
├── lib/
│   ├── utils.ts                # Utility functions
│   └── api.ts                  # Mock API functions
└── types/
    └── index.ts                # TypeScript definitions
```

## Page Specifications

### 1. Home Page (`/`)
**Content:**
- App title: "YouTube Multilingual Dubber"
- Tagline: "Transform your content with AI-powered multilingual dubbing"
- Brief description (2-3 sentences)
- Prominent "Start Dubbing" button → `/new`
- Clean, centered layout

**Design Elements:**
- Large, bold typography
- Minimal color palette (blacks, whites, grays)
- Sharp geometric shapes
- Subtle hover animations

### 2. Upload Form Page (`/new`)
**Form Fields:**
- Voice Track Upload (required)
  - Drag & drop or click to upload
  - File type: audio files only
  - Max size: 100MB
- Background Track Upload (optional)
  - Same upload interface
- Target Language Selection
  - Dropdown with popular languages
  - Options: English, Spanish, French, German, Japanese, Chinese, etc.
- Submit Button

**Validation:**
- Voice track is required
- File type validation
- File size validation
- Show loading state on submit

**Mock API Response:**
- Generate random job ID
- Redirect to `/jobs/[id]`

### 3. Job Status Page (`/jobs/[id]`)
**Content:**
- Job ID display
- Progress indicator (0-100%)
- Status messages:
  - "Uploading files..."
  - "Processing audio..."
  - "Generating dubs..."
  - "Finalizing..."
  - "Complete!"
- Download buttons (mock)
  - "Download Voice Dub"
  - "Download Background Dub"
  - "Download Combined"

**Progress Simulation:**
- Animate progress bar over 10-15 seconds
- Update status messages at intervals
- Show completion state

## Component Specifications

### FileUpload Component
```typescript
interface FileUploadProps {
  label: string;
  required?: boolean;
  accept: string;
  maxSize: number;
  onFileSelect: (file: File) => void;
  error?: string;
}
```

### LanguageSelect Component
```typescript
interface LanguageSelectProps {
  value: string;
  onChange: (language: string) => void;
  languages: Language[];
}

interface Language {
  code: string;
  name: string;
  flag: string;
}
```

### ProgressBar Component
```typescript
interface ProgressBarProps {
  progress: number; // 0-100
  status: string;
  isComplete: boolean;
}
```

## Mock API Functions
```typescript
// lib/api.ts
export const submitDubbingJob = async (data: DubbingJobData): Promise<{ jobId: string }> => {
  // Mock API call - return random job ID
  return { jobId: Math.random().toString(36).substr(2, 9) };
};

export const getJobStatus = async (jobId: string): Promise<JobStatus> => {
  // Mock API call - return job status
  return {
    id: jobId,
    status: 'processing',
    progress: 45,
    message: 'Generating dubs...'
  };
};
```

## Styling Guidelines

### Color Palette
- Primary: `#000000` (Black)
- Secondary: `#1a1a1a` (Dark Gray)
- Accent: `#ffffff` (White)
- Text: `#333333` (Dark Gray)
- Muted: `#666666` (Medium Gray)
- Border: `#e5e5e5` (Light Gray)

### Typography
- Headings: Inter, bold, sharp
- Body: Inter, regular
- Monospace: JetBrains Mono (for job IDs)

### Spacing
- Use Tailwind's spacing scale
- Consistent 8px grid system
- Generous whitespace

### Animations
- Subtle hover effects (scale, opacity)
- Smooth transitions (200-300ms)
- Progress bar animations
- Page transitions

## Development Approach with MCP Integration

### Phase 1: Planning & Architecture (Use deliberate thinking)
1. **Use `deliberatethinking` to analyze:**
   - Overall project architecture and component hierarchy
   - User experience flow and interaction patterns
   - Design system decisions and component specifications
   - State management approach and data flow

### Phase 2: Project Setup
1. **Initialize Next.js 14 project:**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
   ```

2. **Install dependencies:**
   ```bash
   npm install framer-motion
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input label select progress
   ```

3. **Configure Tailwind:**
   - Update `tailwind.config.js` with custom colors
   - Add Inter font to `layout.tsx`

### Phase 3: Component Development (Use deliberate thinking)
1. **For each major component, use `deliberatethinking` to:**
   - Plan component structure and props interface
   - Design interaction patterns and user feedback
   - Solve complex styling and animation challenges
   - Debug and optimize component behavior

2. **Build components:**
   - FileUpload component with drag & drop
   - LanguageSelect with search/filter
   - ProgressBar with smooth animations
   - Navigation with responsive design

### Phase 4: Page Implementation (Use deliberate thinking)
1. **Use `deliberatethinking` to plan:**
   - Page layouts and responsive behavior
   - Form validation logic and error handling
   - State management across pages
   - User flow optimization

2. **Implement pages:**
   - Home page with hero section
   - Upload form with validation
   - Job status with progress simulation

### Phase 5: API Integration & Testing (Use deliberate thinking)
1. **Use `deliberatethinking` to design:**
   - Mock API structure and data flow
   - Error handling strategies
   - Loading state management
   - User feedback systems

2. **Add mock API:**
   - Create API functions in `lib/api.ts`
   - Implement form submission logic
   - Add progress simulation

### Phase 6: Polish & Optimization (Use deliberate thinking)
1. **Use `deliberatethinking` to optimize:**
   - Performance and bundle size
   - Accessibility and user experience
   - Code organization and maintainability
   - Animation timing and easing

2. **Final touches:**
   - Add loading states
   - Implement error handling
   - Test all interactions
   - Ensure responsive design

## Expected Outcome
A fully functional, locally runnable Next.js application that:
- Looks sharp, modern, and professional
- Has smooth animations and interactions
- Handles file uploads with validation
- Simulates job processing with progress
- Provides a complete user flow
- Runs on `http://localhost:3000`

## Success Criteria
- [ ] Site loads without errors
- [ ] All three pages are accessible
- [ ] File upload works with validation
- [ ] Form submission generates job ID
- [ ] Progress simulation works smoothly
- [ ] Design matches specifications
- [ ] Responsive on mobile/desktop
- [ ] TypeScript types are correct
- [ ] Animations are smooth and subtle
- [ ] MCP deliberate thinking was used for complex decisions
- [ ] Code is well-structured and maintainable

## MCP Integration Guidelines
- **Always use `deliberatethinking` for complex problems** - don't skip this step
- **Break down large tasks** into smaller, manageable pieces using the tool
- **Document your thinking process** - the MCP tool helps with this
- **Use it for debugging** - when something doesn't work, think through it systematically
- **Plan before coding** - use deliberate thinking to plan component interfaces and data flow
- **Optimize iteratively** - use the tool to refine and improve your solutions

## Notes
- Keep the design minimal and clean
- Focus on user experience and flow
- Use proper TypeScript throughout
- Ensure accessibility basics
- Test all interactive elements
- Make it feel premium and professional
- **Leverage the MCP server for better development decisions**

When complete, run `npm run dev` and provide the localhost URL for preview.

## MCP Usage Examples
Here are specific ways to use the deliberate thinking tool during development:

1. **Component Planning:**
   ```
   Use deliberate thinking to plan the FileUpload component:
   - What props does it need?
   - How should drag & drop work?
   - What validation states are needed?
   - How should errors be displayed?
   ```

2. **Architecture Decisions:**
   ```
   Use deliberate thinking to decide on state management:
   - Should we use React state or a context?
   - How should form data flow between components?
   - What's the best way to handle file uploads?
   ```

3. **Problem Solving:**
   ```
   Use deliberate thinking when debugging:
   - Why isn't the progress bar animating?
   - How can we improve the user experience?
   - What's the best way to handle errors?
   ```