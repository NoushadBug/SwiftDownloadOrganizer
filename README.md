# Swift Download Organizer

Swift Download Organizer is a Chrome extension that automatically manages your download folders based on advanced, customizable rules. Organize your downloads by file extension, extension groups, or source URL, and keep your files tidy with ease.

## Features

- **Rule-based Download Organization:**  
  Automatically move downloads to specific folders based on file extension, extension group, or source URL.

- **Extension Groups:**  
  Group file extensions (e.g., Images, Videos, Documents) for easier rule management.

- **Drag-and-Drop Rule Ordering:**  
  Reorder rules by dragging to set their precedence.

- **Import/Export:**  
  Backup or transfer your rules and extension groups as JSON files.

- **Side Panel UI:**  
  Manage rules and groups from a convenient side panel.

## Getting Started

### Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the project directory.

### Usage

- Click the extension icon to open the side panel.
- Add, edit, or delete rules to control how downloads are organized.
- Manage extension groups for bulk rule creation.
- Use the import/export buttons to backup or restore your configuration.

## File Structure

- `manifest.json` — Chrome extension manifest.
- `background.js` — Handles download events and applies rules.
- `sidepanel.html` — Side panel UI for managing rules and groups.
- `sidepanel.js` — Logic for the side panel UI.
- `styles/` — CSS files (Tailwind, custom styles, DataTables, Boxicons).
- `scripts/` — JS libraries (jQuery, SortableJS, DataTables, Tailwind).
- `images/` — Extension icon.

## Development

- UI uses [Tailwind CSS](styles/tailwind.css) and [Boxicons](https://boxicons.com/).
- Drag-and-drop is powered by [SortableJS](scripts/Sortable.min.js).
- DataTables and jQuery are included for potential table enhancements.

## Permissions

- `downloads`, `storage`, `tabs`, `activeTab`, `sidePanel`, `<all_urls>`

## License

MIT

---

**Note:**  
This extension does not upload or share your data. All rules and settings are stored locally in Chrome's sync storage.
