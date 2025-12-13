# YouTube Playlist Multi-Select Fix

This Chrome extension restores the old YouTube behavior where the "Save to playlist" menu stays open, allowing you to add a video to multiple playlists at once.

## The Problem

In recent YouTube updates, when you click to save a video to a playlist, the menu automatically closes after selecting just one playlist. This forces you to reopen the menu each time you want to add the video to another playlist.

## The Solution

This extension keeps the "Save to playlist" menu open after you select a playlist, just like the old behavior. You can select as many playlists as you want before manually closing the menu.

## Features

✅ **Keeps playlist menu open** - Select multiple playlists without the menu closing  
✅ **Full add/remove functionality** - Click to add to a playlist, click again to remove  
✅ **Manual close options** - Click outside the menu or press ESC to close when done  
✅ **No interference** - Doesn't block normal YouTube functionality

## Installation Instructions

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Download the extension files**
   - Make sure you have all the files in a folder:
     - `manifest.json`
     - `content.js`
     - `icon16.png`, `icon48.png`, `icon128.png`

2. **Open Chrome Extensions Page**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Or click the three dots menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing the extension files
   - The extension should now appear in your extensions list

5. **Test It Out**
   - Go to YouTube
   - Click the "Save" button under a video
   - Try adding the video to multiple playlists
   - The menu should stay open!
   - Click outside the menu or press ESC when done

## How It Works

The extension intercepts YouTube's automatic close behavior while allowing normal interactions:

1. **Blocks auto-close**: Prevents the menu from closing after clicking a playlist
2. **Allows playlist clicks**: All add/remove functionality works normally
3. **Manual close**: Backdrop clicks and ESC key still close the menu when you want

## Usage

1. Click the "Save" button under any YouTube video
2. Click on playlists to add the video to them
3. Click again to remove from a playlist (toggle behavior)
4. When done, click outside the menu or press ESC to close it

## Troubleshooting

### The extension disappears from Chrome
This is Chrome's security feature that periodically disables "unpacked" extensions. **Solutions:**

1. **Quick fix**: Just reload the extension each time
   - Go to `chrome://extensions/`
   - Click "Load unpacked" and select the extension folder again

2. **Better fix**: Keep extension in a permanent location
   - Create a folder like `C:\ChromeExtensions\YouTubePlaylistFix\` (Windows)
   - Or `~/ChromeExtensions/YouTubePlaylistFix/` (Mac/Linux)
   - Extract extension files there permanently
   - Load from this location
   - **Don't delete or move this folder!**

3. **Re-enable Developer Mode if needed**
   - Chrome sometimes disables "Developer mode"
   - Toggle it back on in `chrome://extensions/`

### The extension isn't working
- Make sure the extension is enabled in `chrome://extensions/`
- **Refresh the YouTube page** after installing or re-enabling
- Check the browser console (F12) for green "[Playlist Fix]" messages
- If you don't see the messages, the extension didn't load - try reloading it

### The extension stops working after visiting different videos
- This should now be fixed in v3.1+
- If it still happens, **completely remove and reload the extension**
- Make sure you're using the latest version (v3.1.0)
- Check console for any error messages

### The menu still closes automatically
- Make sure you see "[Playlist Fix] V3.1 Loaded" in console (F12)
- Try refreshing the page
- Disable and re-enable the extension
- Make sure no other YouTube extensions are conflicting
- Check that Developer Mode is still enabled

### Clicking a playlist doesn't add/remove the video
- This is normal YouTube behavior being preserved
- Make sure you're clicking on the playlist name, not outside it
- Check if the video is already in the playlist (toggle behavior)

### The bookmark icon doesn't update
- This is a known limitation due to YouTube's internal state management
- The video is still being added/removed correctly
- Closing and reopening the menu will show the correct state

## Known Limitations

- The bookmark icon next to each playlist may not update immediately (visual only, doesn't affect functionality)
- Extension needs to be reloaded if YouTube makes significant code changes

## Updates

If YouTube changes their code again, this extension may need updates. The extension logs its activity to the browser console (F12) for debugging.

## Privacy

This extension:
- Only runs on YouTube.com
- Does not collect any data
- Does not track your activity
- Only modifies local behavior in your browser
- Does not communicate with any external servers

## Technical Details

The extension works by:
- Detecting when YouTube's playlist dropdown appears
- Overriding the automatic close functionality
- Preserving all normal click and interaction behavior
- Allowing manual close via backdrop click or ESC key

## License

Free to use and modify as needed!

## Changelog

### Version 3.2.0 (January 2025)
- **Added**: Click outside the menu (backdrop) to close it
- **Improved**: Dual backdrop detection system (capture phase + global handler)
- **Improved**: Better event handling with stopImmediatePropagation
- **Improved**: Multiple backdrop setup attempts at different timing intervals
- Works alongside ESC key for closing

### Version 3.1.0 (January 2025)
- **Fixed**: Extension now survives YouTube's client-side navigation
- **Fixed**: Works persistently across page changes
- **Fixed**: Watches for YouTube navigation events and re-initializes
- **Improved**: Better manifest to reduce Chrome warnings
- **Improved**: Prevents multiple script instances from loading
- Added troubleshooting guide for extension disappearing

### Version 1.0
- Initial release
- Keeps playlist menu open for multiple selections
- Preserves add/remove toggle functionality
- Manual close via backdrop or ESC key
