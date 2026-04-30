# BuildTrack Pro - Admin Setup & Usage Guide

## Admin Setup

### Prerequisites

1. **Owner Account**: You must be the project owner with admin role
2. **Manus OAuth**: Set up OAuth credentials with Manus
3. **Environment Variables**: Configure all required environment variables

### Initial Setup

#### Step 1: Configure Owner Identity

Set these environment variables:

```
OWNER_OPEN_ID=your-manus-open-id
OWNER_NAME=Your Full Name
VITE_APP_ID=your-manus-app-id
```

#### Step 2: Set Up OAuth

1. Register your application with Manus OAuth
2. Get your `VITE_APP_ID` and `OAUTH_SERVER_URL`
3. Configure redirect URL: `https://your-domain.com/api/oauth/callback`

#### Step 3: Database Configuration

```
DATABASE_URL=mysql://user:password@host:port/construction_tracker
```

#### Step 4: API Keys

```
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
JWT_SECRET=generate-a-random-secret-key
```

### First Login

1. Go to your application URL
2. Click "Admin Dashboard" button
3. Click "Login with Manus"
4. You'll be redirected to Manus OAuth
5. Authorize the application
6. You'll be logged in as admin

## Admin Dashboard Usage

### Creating a Project

1. Go to Admin Dashboard (`/admin`)
2. Click "+ New Project" button
3. Fill in project details:
   - **Project Name** (required): Name of the construction project
   - **Description**: Project overview and details
   - **Start Date**: When construction begins
   - **End Date**: Expected completion date
4. Click "Create Project"
5. Your project will appear in the list with a unique access code

### Managing Projects

#### View Project Details

1. Click "Manage" button on any project card
2. You'll see:
   - Project information and dates
   - Current progress percentage
   - Unique access code (with copy button)
   - All construction updates organized by category

#### Edit Project

1. Click "Edit" button on any project card
2. Update any project details
3. Click "Update Project"

#### Delete Project

1. Click the trash icon on any project card
2. Confirm deletion in the dialog
3. Project and all associated updates will be deleted

#### Regenerate Access Code

1. Go to project detail page
2. Click "Regenerate" button next to access code
3. A new access code will be generated
4. Old code will no longer work
5. Share new code with clients

### Managing Project Updates

#### Upload Construction Update

1. Go to project detail page
2. Click "+ Add Update" button
3. Fill in update details:
   - **Work Category** (required):
     - โครงสร้าง (Structure) - Foundation, walls, roof
     - งานระบบ (Systems) - Electrical, plumbing, HVAC
     - งานตกแต่ง (Interior Finishing) - Paint, flooring, fixtures
   - **Description** (required): What was accomplished
   - **Photos** (required): Upload one or more photos
4. Click "Upload Update"
5. Update will appear in the timeline

#### Delete Update

1. Go to project detail page
2. Find the update you want to delete
3. Click the trash icon on the update card
4. Confirm deletion

### Sharing with Clients

#### Provide Access Code

1. Go to Admin Dashboard
2. Find the project
3. Click "Manage" to see the access code
4. Copy the access code (click copy button)
5. Share code with client via:
   - Email
   - SMS
   - WhatsApp
   - Print on contract

#### Client Access Instructions

Provide clients with:

1. Your website URL
2. Their unique access code
3. Instructions:
   - Go to website
   - Click "View Your Project"
   - Enter access code
   - View project timeline and photos

### Best Practices

#### Photography

- Take clear, well-lit photos
- Include multiple angles
- Show progress and details
- Update regularly (weekly recommended)

#### Descriptions

- Be specific about work completed
- Mention any challenges or delays
- Highlight quality and craftsmanship
- Use clear, professional language

#### Categories

- Assign updates to correct categories
- Group related work together
- Maintain consistent categorization

#### Access Codes

- Generate unique codes per client
- Regenerate if code is compromised
- Keep track of which client has which code
- Consider regenerating periodically

### Monitoring Progress

#### Progress Percentage

- Manually update progress percentage
- Based on actual completion
- Update with each major milestone
- Communicate with clients about delays

#### Category Breakdown

- View progress by work category
- Helps clients understand timeline
- Shows which phases are complete
- Identifies bottlenecks

#### Timeline View

- Clients see chronological updates
- Photos organized by category
- Dates and descriptions visible
- Professional presentation

## Troubleshooting

### Can't Login

**Problem**: "You do not have permission" error

**Solution**:
- Verify your `OWNER_OPEN_ID` is correct
- Ensure you're using the correct Manus account
- Check that your account has admin role
- Contact support if issue persists

### Access Code Not Working

**Problem**: Client gets "Invalid access code" error

**Solution**:
- Verify access code is correct (case-sensitive)
- Check if code was regenerated recently
- Ensure project is active
- Try copying code again from dashboard

### Photos Not Uploading

**Problem**: Upload fails or times out

**Solution**:
- Check file size (keep under 10MB)
- Verify file format (JPG, PNG, WebP)
- Check internet connection
- Try uploading one photo at a time
- Clear browser cache and retry

### Project Not Appearing

**Problem**: Created project but can't see it

**Solution**:
- Refresh the page
- Clear browser cache
- Verify you're logged in as admin
- Check that project is active

### Client Can't Access Project

**Problem**: Client enters code but gets error

**Solution**:
- Verify access code is correct
- Check project is active
- Ensure project has at least one update
- Try regenerating access code
- Have client clear browser cache

## Security Tips

1. **Access Codes**: Keep codes confidential
2. **Regenerate**: Regenerate codes if shared with unauthorized people
3. **Logout**: Always logout when done
4. **Passwords**: Use strong passwords for your account
5. **Backups**: Regularly backup important project data

## Advanced Features

### Multiple Projects

- Create separate projects for each property
- Use unique access codes per project
- Manage all from one dashboard
- Track multiple timelines

### Team Collaboration

- Share admin credentials securely
- Use different accounts for different team members
- Track who made changes
- Maintain audit trail

### Client Communication

- Use updates to communicate progress
- Include photos in descriptions
- Update regularly to manage expectations
- Be transparent about delays

## Support

For issues or questions:

1. Check this guide
2. Review README.md
3. Check DEPLOYMENT.md
4. Create GitHub issue
5. Contact support team

## FAQ

**Q: Can I edit an update after uploading?**
A: Currently, you can only delete and re-upload. Edit functionality coming soon.

**Q: How many photos can I upload per update?**
A: Unlimited, but recommended 5-10 for performance.

**Q: Can clients see who uploaded updates?**
A: No, only the update content is visible to clients.

**Q: What happens if I delete a project?**
A: All updates and photos are permanently deleted. This cannot be undone.

**Q: Can I change the access code format?**
A: Currently 8-character alphanumeric. Custom formats coming soon.

**Q: How long are access codes valid?**
A: Indefinitely until you regenerate them.

**Q: Can multiple clients share one access code?**
A: Yes, but they'll all see the same project.

**Q: Is there a limit to number of projects?**
A: No limit. Create as many as needed.

---

**BuildTrack Pro** - Professional Construction Tracking
