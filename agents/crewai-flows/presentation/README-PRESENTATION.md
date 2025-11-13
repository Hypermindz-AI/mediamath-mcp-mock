# Customer Presentation Guide

## Overview

This interactive HTML presentation showcases the MediaMath MCP CrewAI Flows system with a focus on business value, use cases, and the natural language AI approach.

**File**: `customer-presentation.html`
**Format**: Reveal.js interactive slides
**Slides**: 18 slides covering approach, use cases, and benefits
**Duration**: 20-30 minutes (adjustable based on audience)

---

## Quick Start

### Option 1: Open Locally (Easiest)

```bash
# Navigate to presentation folder
cd agents/crewai-flows/presentation

# Open in your default browser
open customer-presentation.html        # Mac
xdg-open customer-presentation.html    # Linux
start customer-presentation.html       # Windows
```

### Option 2: Serve with Python

```bash
# Start a local server
cd agents/crewai-flows/presentation
python3 -m http.server 8080

# Then open in browser:
# http://localhost:8080/customer-presentation.html
```

### Option 3: Deploy to GitHub Pages

The presentation can be viewed directly from GitHub:
```
https://hypermindz-ai.github.io/mediamath-mcp-mock/agents/crewai-flows/presentation/customer-presentation.html
```

---

## Presentation Controls

### Navigation
- **Next Slide**: `Space`, `→`, `↓`, or `Page Down`
- **Previous Slide**: `←`, `↑`, or `Page Up`
- **Slide Overview**: Press `ESC` (press again to exit)
- **Fullscreen**: Press `F`
- **Speaker Notes**: Press `S` (opens separate window)
- **Help Menu**: Press `?`

### Tips for Presenting
1. **Use Overview Mode** (ESC) to jump between sections
2. **Use fullscreen** (F) for distraction-free presentation
3. **Practice navigation** before presenting
4. **Test on presentation screen** beforehand

---

## Presentation Structure

### Section 1: Introduction (Slides 1-3)
- **Slide 1**: Title slide
- **Slide 2**: Executive summary with key metrics
- **Slide 3**: Current challenges in campaign management

### Section 2: The Solution (Slides 4-6)
- **Slide 4**: Our approach (Natural Language + AI Agents)
- **Slide 5**: How it works (Architecture flow)
- **Slide 6**: Key differentiators

### Section 3: Use Cases (Slides 7-11)
- **Slide 7**: Campaign Setup - Bulk campaign creation
- **Slide 8**: Optimization - Performance optimization
- **Slide 9**: Analytics - Instant reports
- **Slide 10**: Compliance - Security audits
- **Slide 11**: Creative Management - Creative refresh

### Section 4: Value & Demo (Slides 12-15)
- **Slide 12**: Demo scenarios (how to try it)
- **Slide 13**: Business impact and ROI
- **Slide 14**: Technical excellence
- **Slide 15**: Success metrics and KPIs

### Section 5: Closing (Slides 16-18)
- **Slide 16**: Getting started (implementation phases)
- **Slide 17**: Q&A and contact information
- **Slide 18**: Thank you slide

---

## Customization Tips

### Quick Edits
The presentation is a single HTML file. To customize:

1. **Change Colors**: Edit CSS variables at the top:
```css
:root {
    --primary-color: #2563eb;     /* Blue */
    --secondary-color: #10b981;   /* Green */
    --accent-color: #f59e0b;      /* Orange */
}
```

2. **Update Content**: Find the section you want to edit (search for slide titles)

3. **Add Company Logo**: Add an image tag to the title slide:
```html
<img src="your-logo.png" style="max-height: 100px; margin-bottom: 30px;">
```

4. **Adjust Timing**: Modify auto-advance settings in the script section

### Advanced Customization
- Change theme: Replace `theme/night.min.css` with other reveal.js themes
- Add animations: Use `data-auto-animate` attribute on sections
- Add transitions: Change `transition: 'slide'` in JavaScript config

---

## Exporting to PDF

### Method 1: Print from Browser
1. Open presentation in Chrome/Edge
2. Add `?print-pdf` to URL: `customer-presentation.html?print-pdf`
3. Press `Ctrl+P` (or `Cmd+P` on Mac)
4. Select "Save as PDF"
5. Set margins to "None"
6. Enable "Background graphics"

### Method 2: Use decktape (High Quality)
```bash
npm install -g decktape
decktape reveal customer-presentation.html presentation.pdf
```

---

## Presenting to Different Audiences

### For Executives (15-20 minutes)
**Focus on**: Slides 1-6, 12-13, 16-18
- Skip detailed use case slides
- Emphasize business impact and ROI
- Focus on getting started

### For Technical Teams (30-40 minutes)
**Full presentation** with emphasis on:
- Architecture (Slide 5)
- Technical excellence (Slide 14)
- Integration details
- Allow time for technical Q&A

### For Product/Marketing Teams (25-35 minutes)
**Focus on**: Slides 1-11, 16-17
- All use cases in detail
- Demo scenarios
- Practical applications
- Getting started guide

---

## Live Demo During Presentation

On Slide 12 (Demo Scenarios), you can run live demos:

### Option 1: Pre-recorded Terminal Session
Record a terminal session showing:
```bash
python main.py -q "Create 5 test campaigns with $1000 each"
```

### Option 2: Live Execution (If confident)
```bash
# In a separate terminal window
cd /path/to/crewai-flows
python main.py -q "Show me campaign performance report"
```

### Option 3: Show Testing UI
Open in browser during presentation:
```
https://mediamath-mcp-mock-two.vercel.app/test
```

---

## Troubleshooting

### Presentation Not Loading
- **Issue**: Blank page or errors
- **Fix**: Check browser console (F12) for errors
- **Alternative**: Try different browser (Chrome recommended)

### Slides Not Advancing
- **Issue**: Navigation keys not working
- **Fix**: Click on presentation once to focus
- **Alternative**: Use on-screen controls (bottom right)

### Styling Issues
- **Issue**: Content overlapping or misaligned
- **Fix**: Reload page (Ctrl+R or Cmd+R)
- **Fix**: Check browser zoom is at 100%

### CDN Resources Not Loading
- **Issue**: Reveal.js not loading (requires internet)
- **Fix**: Download reveal.js locally or ensure internet connection

---

## Additional Resources

### Included Files
- `customer-presentation.html` - Main presentation
- `README-PRESENTATION.md` - This guide

### Links in Presentation
- **GitHub Repository**: https://github.com/Hypermindz-AI/mediamath-mcp-mock
- **Live Demo Server**: https://mediamath-mcp-mock-two.vercel.app
- **Testing UI**: https://mediamath-mcp-mock-two.vercel.app/test

### Supporting Materials
- Full documentation: `/agents/crewai-flows/README.md`
- Implementation guide: `/docs/CREWAI_IMPLEMENTATION_GUIDE.md`
- Project completion doc: `/agents/crewai-flows/PROJECT_COMPLETE.md`

---

## Best Practices

### Before Presenting
1. ✅ Test presentation on actual presentation equipment
2. ✅ Have backup PDF version ready
3. ✅ Close unnecessary browser tabs
4. ✅ Disable browser extensions that might interfere
5. ✅ Test all demo scenarios
6. ✅ Prepare answers for common questions
7. ✅ Set browser to fullscreen mode

### During Presentation
1. 🎯 Start with overview (ESC key) to show structure
2. 🎯 Use natural navigation (arrow keys, not mouse)
3. 🎯 Pause on use case slides for questions
4. 🎯 Highlight demo scenarios early
5. 🎯 Keep technical details high-level unless asked
6. 🎯 End with clear call to action

### After Presenting
1. 📧 Share presentation file with attendees
2. 📧 Send links to live demo and GitHub
3. 📧 Follow up with personalized next steps
4. 📊 Gather feedback for improvements

---

## FAQs

**Q: Can I edit this presentation?**
A: Yes! It's a single HTML file. Open in any text editor and modify the content.

**Q: Does it work offline?**
A: Mostly yes, but it loads Reveal.js from CDN. For fully offline, download reveal.js locally.

**Q: Can I share this with clients?**
A: Yes! You can email the HTML file or share a link if hosted online.

**Q: How do I add my company branding?**
A: Edit the CSS colors and add your logo image in the title slide.

**Q: Can I export individual slides as images?**
A: Yes! Use browser screenshot tools or print to PDF then extract pages.

---

## Support

For issues or questions:
- Check presentation file for embedded notes
- Review CrewAI Flows documentation
- Test with different browsers
- Contact: See slide 17 for details

---

**Last Updated**: November 2025
**Version**: 1.0
**Created for**: Hypermindz AI
