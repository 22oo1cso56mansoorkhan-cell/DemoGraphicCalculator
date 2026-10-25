# GraphLab — Interactive Mathematics

An advanced, browser-based mathematical graphing calculator inspired by Desmos. **GraphLab** features a high-performance 2D Cartesian coordinate plane and a vertically scrollable expression editor with continuous animated sliders, tables, draggable points, implicit conic equations, inequalities, linear regression, folders, notes, and image insertion.

---

## 🌟 Key Features

### 1. Interactive Cartesian Coordinate Plane
- **Adaptive Grid System:** Sub-pixel major and minor grid lines that scale adaptively across zoom levels.
- **Axes & Tick Marks:** Dynamic numerical labels on X and Y axes, zero origin marker $(0, 0)$, and custom boundary settings.
- **Pan & Zoom:** Smooth click-and-drag panning and mouse-wheel zooming centered around the cursor.
- **Hover Inspection & Tracing:** Interactive crosshair tracer displaying exact coordinates $(x, y)$ of curves and points under the cursor.
- **Viewport Floating Controls:** Quick Zoom In (+), Zoom Out (-), and Reset to Default View (Home).

### 2. Desmos-Inspired Expression Panel
- **Independent Expression Rows:** Each row includes a row number, color swatch, mathematical input, visibility toggle, error display, and delete action.
- **Add Item (+) Menu:**
  1. **Expression:** Equations, functions, variables, points, or inequalities.
  2. **Note:** Rich mathematical text explanations and instructions.
  3. **Table:** Spreadsheet-like $x_1, y_1$ table with scatter points, connect-lines toggle, and color customization.
  4. **Inference (Linear Regression):** Computes $y = mx + b$, $R^2$ fit, and correlation $r$ from table data and plots the regression line.
  5. **Folder:** Collapsible containers to group and organize equations with bulk show/hide controls.
  6. **Image:** Upload and plot local images onto graph coordinates with custom position $(x, y)$, dimensions, and opacity.
- **Panel Collapse & Expand:** Collapse the expression panel to maximize graph canvas width, with an accessible reopen tab.

### 3. Sliders & Continuous Variable Animation Loop
- **Adjustable Variable Sliders:** Variables like `a = 2` or `b = 0` automatically generate sliders with configurable min, max, step, and current value.
- **▶ Play / ⏸ Pause Animation Engine:** Uses `requestAnimationFrame` to continuously animate parameters (e.g. moving waves $y = a\sin(x - b)$, expanding circles, or transforming parabolas).
- **Animation Controls:** Configurable animation speed ($0.5\times, 1\times, 2\times, 4\times$) and playback mode (**loop** or **ping-pong** back-and-forth).
- **Reactive Dependency Resolution:** Updating any slider immediately updates all dependent functions, tables, and regression lines without page reloads.

### 4. Mathematical Engine & Syntax Support
- **Zero `eval()` or `Function()`:** Safe tokenizer and Shunting-Yard evaluator.
- **Implicit Multiplication:** Supports notation like `2x`, `3(x+1)`, and `a(x)`.
- **Explicit Functions:** $y = f(x)$, $f(x) = \sin(x)$, $y = ax^2 + bx + c$.
- **Asymptote & Discontinuity Detection:** Functions like $y = 1/x$ or $y = \tan(x)$ automatically break into continuous segments rather than drawing connecting lines across singularities.
- **Implicit Equations (Marching Squares):** Conic sections and circular equations such as $x^2 + y^2 = 25$ and $x^2/9 + y^2/4 = 1$ render via 2D contouring.
- **Inequalities (Shaded Regions):** Expressions like $y > x^2 - 2$ or $y \le 2x + 1$ render with translucent shaded fills and dashed/solid boundaries.
- **Draggable Interactive Points:** Expressions like $A = (3, 2)$ render as interactive point handles on the graph that can be dragged directly with the mouse to update values.
- **Mathematical Functions:** `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sqrt`, `abs`, `log`, `ln`, `exp`, `floor`, `ceil`, `round`.
- **Angle Modes:** Toggle between **Radians** (default) and **Degrees**.

### 5. Workspace Persistence & Export
- **LocalStorage Auto-Save:** Automatically persists equations, sliders, tables, folders, and viewport bounds across page reloads.
- **Undo / Redo Stack:** Keyboard shortcuts `Ctrl+Z` (Undo) and `Ctrl+Y` (Redo).
- **Export Graph as Image (PNG):** Captures high-resolution canvas plots for reports.
- **JSON Workspace Serialization:** Export the complete workspace to a `.json` file and import saved files with schema validation.
- **On-Screen Math Keypad:** Accessible mathematical keypad for mobile and touch devices.
- **Light & Dark Themes:** Built-in theme switcher with high-contrast mathematical colors.

---

## 📁 Project Structure

```
demographicCalculator/
├── public/
├── src/
│   ├── components/
│   │   ├── expressions/
│   │   │   ├── AddItemMenu.tsx         # (+) Add item dropdown (Expression, Note, Table, etc.)
│   │   │   ├── ExpressionPanel.tsx     # Left scrollable expression panel with collapse toggle
│   │   │   ├── ExpressionRow.tsx       # Expression editor with color picker & animated slider
│   │   │   ├── FolderRow.tsx           # Collapsible folder group component
│   │   │   ├── ImageRow.tsx            # Graph coordinate image placement component
│   │   │   ├── InferenceRow.tsx        # Linear regression analysis on table data
│   │   │   ├── NoteRow.tsx             # Text / note row
│   │   │   └── TableRow.tsx            # Spreadsheet data table component
│   │   ├── graph/
│   │   │   └── CoordinateCanvas.tsx    # HTML5 Canvas coordinate plane, contouring & draggable points
│   │   ├── keypad/
│   │   │   └── MathKeypad.tsx          # On-screen mathematical keypad
│   │   ├── modals/
│   │   │   ├── ExportModal.tsx         # PNG image & JSON workspace export/import
│   │   │   ├── HelpShortcutsModal.tsx  # Keyboard shortcuts & math syntax reference
│   │   │   └── SettingsModal.tsx       # Radians/degrees, grid/axes toggles & window bounds
│   │   └── toolbar/
│   │       └── TopToolbar.tsx          # Top bar with document rename, undo/redo, export, settings
│   ├── hooks/
│   │   └── useGraphLabState.ts         # Master state hook, animation frame loop, undo/redo & storage
│   ├── types/
│   │   ├── defaultWorkspace.ts         # Starter gallery with animated wave, parabola, circle, table
│   │   └── graphlab.ts                 # Core TypeScript interfaces
│   ├── utils/
│   │   ├── mathEngine.ts               # Safe tokenizer, RPN evaluator, contouring, regression
│   │   └── mathEngine.test.ts          # Vitest test suite for math engine
│   ├── App.tsx                         # Main application layout
│   ├── index.css                       # Tailwind CSS v4 styling & dark mode tokens
│   └── main.tsx                        # Entry point
├── index.html                          # HTML entry, typography, title & favicon
├── package.json                        # Dependencies and npm scripts
├── tsconfig.json                       # TypeScript compiler options
├── vite.config.ts                      # Vite build configuration
└── README.md                           # Documentation
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 3. Run Unit Tests
```bash
npm test
```
All unit tests in `src/utils/mathEngine.test.ts` pass verifying tokenizing, RPN parsing, function evaluation, variable scope, asymptote segmentation, and linear regression.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 📝 Syntax Reference & Examples

| Expression Type | Example Syntax | Behavior |
|---|---|---|
| **Explicit Function** | `y = x^2 - 4` or `f(x) = sin(x)` | Plots continuous curve on coordinate plane |
| **Variable with Slider** | `a = 2` | Generates interactive slider with ▶ Play animation |
| **Animated Moving Wave** | `y = a * sin(x - b)` | Animate `b` to observe a traveling sinusoidal wave |
| **Implicit Conic Equation** | `x^2 + y^2 = 25` | Marching-squares contouring renders a circle with radius 5 |
| **Inequality** | `y > x^2 - 2` | Plots boundary curve and translucent shaded region |
| **Draggable Point** | `A = (3, 2)` | Interactive point handle directly draggable on the canvas |
| **Data Table** | Columns $x_1, y_1$ | Plots scatter points with optional connected polylines |
| **Linear Regression** | `y ~ m*x + b` | Fits least-squares line with slope, intercept, and $R^2$ |
