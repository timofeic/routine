# Kids Daily Routine App

A fun and interactive Next.js app designed to help children complete their morning and evening routines. Built with visual task cards, timers, and gamification to make daily routines engaging for kids aged 4-5 and up.

## Try it out
https://routine-bice.vercel.app/

## Features

### 🎯 Core Functionality
- **Morning & Evening Routines**: Pre-configured tasks for both morning and evening routines
- **Visual Task Cards**: Large emoji icons and clear text for easy recognition
- **Interactive Timers**: Track how long each task takes with start/stop timers
- **Progress Tracking**: Visual progress bars show completion status
- **Celebration Animations**: Confetti and encouraging messages when tasks are completed

### 👥 Multiplayer Mode
- **Race Mode**: All kids complete their routines simultaneously
- **Split-Screen Layout**: Each child has their own swimlane with tasks
- **Real-Time Progress**: See who's ahead and encourage teamwork
- **Group Celebrations**: Special celebrations when everyone finishes

### 🏆 Gamification
- **Personal Bests**: Track each child's best time for every task
- **World Records**: Family-wide records for fastest task completion
- **Achievement Badges**: Visual indicators for new records (🥇 World Record, 🎖️ Personal Best)
- **Stats Dashboard**: View all records and achievements in one place

### ⚙️ Customization
- **Manage Kids**: Add, edit, or remove child profiles with custom avatars
- **Customize Tasks**: Add, edit, reorder, or remove tasks for each routine
- **Flexible Routines**: Different kids can have different routines

### 📱 iPad Optimized
- Large touch targets for easy interaction
- Bright, colorful interface
- Responsive design for various screen sizes
- No text selection for smoother touch experience

## Default Tasks

### Morning Routine
1. 🚽 Go to the toilet
2. 👕 Get changed
3. 🎒 Pack bag for school
4. 🍳 Eat breakfast
5. 🪥 Brush teeth
6. 👋 Say bye to Mum

### Evening Routine
1. 🧹 Clean up the table after dinner
2. 🧸 Tidy toys in room and living room
3. 🛁 Take a bath/shower
4. 🪥 Brush teeth
5. 🌙 Get changed
6. 📖 Read bedtime story

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser (preferably on an iPad)

### Building for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: canvas-confetti
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage (offline-first)

## Data Storage

All data is stored locally in the browser's localStorage, including:
- Kid profiles (names, avatars, colors)
- Task configurations
- Completion records
- Personal bests and world records
- Active timers

This means:
- ✅ Works completely offline
- ✅ No server or database required
- ✅ Fast and responsive
- ⚠️ Data is device-specific (not synced across devices)
- ⚠️ Clearing browser data will reset everything

## Usage Tips

### For Parents
1. **Initial Setup**: Go to Settings to customize kids' names and avatars
2. **Customize Tasks**: Add or remove tasks based on your family's routine
3. **View Progress**: Check the Records page to see improvements over time
4. **Reset Records**: You can reset by clearing browser data if needed

### For Kids
1. **Choose Your Mode**:
   - Select "Everyone Together!" for multiplayer race mode
   - Or choose your individual profile for solo practice
2. **Start Tasks**: Tap the checkbox to mark tasks complete
3. **Use Timers**: Press "Start Timer" before beginning a task
4. **Beat Records**: Try to complete tasks faster each time!
5. **Celebrate**: Watch the confetti when you finish!

## App Structure

```
app/
├── page.tsx              # Home screen (kid & routine selection)
├── routine/[kidId]/[type]/
│   └── page.tsx         # Individual routine view
├── multiplayer/[type]/
│   └── page.tsx         # Multiplayer race mode
├── admin/
│   └── page.tsx         # Settings & management
├── records/
│   └── page.tsx         # Records & achievements
└── layout.tsx           # Root layout

components/
├── TaskCard.tsx         # Individual task component
├── Timer.tsx           # Timer component
└── Celebration.tsx     # Celebration animation

lib/
├── types.ts            # TypeScript interfaces
└── storage.ts          # LocalStorage helpers

hooks/
└── useLocalStorage.ts  # React hook for data management
```

## Customization Ideas

- Change emoji avatars for kids
- Add new tasks specific to your family
- Modify the color scheme
- Add photos instead of emojis
- Create seasonal routines (school vs. vacation)

## Browser Compatibility

Works best on:
- Safari (iOS/iPadOS)
- Chrome
- Edge
- Firefox

Optimized for iPad but works on any modern browser.

## License

This is a personal project. Feel free to use and modify for your own family!

## Support

If you need to reset the app completely, clear your browser's localStorage for this site.

Enjoy making routines fun! 🎉
