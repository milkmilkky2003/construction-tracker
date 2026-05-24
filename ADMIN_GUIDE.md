# Admin Guide - Construction Tracker

This guide explains how to manage projects and updates as an administrator.

## Initial Setup

### Step 1: Environment Configuration
Ensure your `.env` file has the correct administrator credentials:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password
```

### Step 2: Accessing the Dashboard
1. Navigate to `/admin/login` on your application.
2. Enter the credentials configured in Step 1.
3. You will be redirected to the Admin Dashboard.

## Managing Projects

### Creating a Project
1. Click the "โครงการใหม่" (New Project) button on the dashboard.
2. Enter the project name and description.
3. Select which modules are included (Structure, Systems, Interior).
4. Assign weights to each module (total should be 100%).
5. Click "สร้างโครงการ" (Create Project).

### Project Access Codes
Each project automatically generates a unique 8-character access code.
- Share this code with your clients so they can view progress.
- Clients access their view at `/project/[CODE]`.
- You can regenerate a code if security is compromised.

## Recording Progress

### Uploading Updates
1. Click on a project to view its details.
2. Click "เพิ่ม update" (Add Update).
3. Select the category (Structure, Systems, Interior).
4. Enter a description of the work completed.
5. Upload relevant photos from the site.
6. Click "อัปโหลด update".

### Updating Percentages
1. On the project detail page, click "อัปเดต %" (Update %).
2. Enter the completion percentage for each active module.
3. Update the status (e.g., "ยังไม่เริ่ม", "ปฏิบัติงาน", "เสร็จแล้ว").
4. Click "บันทึกความคืบหน้า".
5. The overall project progress will be automatically calculated based on the module weights.

## Managing Existing Updates
- **Edit**: Click the pencil icon on an update card to change the description, category, or add/remove photos.
- **Delete**: Click the trash icon to permanently remove an update.

## Troubleshooting
- **Database Connection**: Ensure `DATABASE_URL` is correct in your `.env`.
- **Storage Issues**: Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` if images fail to upload.
