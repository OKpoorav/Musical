const LIBRARY_STORAGE_KEY = 'musical_localLibrary';

// Helper to get items from localStorage
const getStoredItems = () => {
  try {
    const items = localStorage.getItem(LIBRARY_STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Error reading from local storage:", error);
    return [];
  }
};

// Helper to save items to localStorage
const saveStoredItems = (items) => {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
};

// Get all library items
export const getLibraryItems = () => {
  return getStoredItems();
};

// Add an item to the library
// item: { id, type, name, artist, imageUrl }
export const addLibraryItem = (item) => {
  if (!item || !item.id || !item.type) {
    console.error("Invalid item format for adding to library:", item);
    return;
  }
  const items = getStoredItems();
  const exists = items.some(i => i.id === item.id && i.type === item.type);
  if (!exists) {
    const newItem = {
      id: item.id,
      type: item.type, // 'track', 'album', 'playlist'
      name: item.name || 'Unknown',
      artist: item.artist || 'Unknown Artist', // Use artist/owner name
      imageUrl: item.imageUrl || '/album-thumb.png'
    };
    saveStoredItems([...items, newItem]);
    console.log('Added to library:', newItem);
  } else {
      console.log('Item already in library:', item);
  }
};

// Remove an item from the library by id and type
export const removeLibraryItem = (itemId, itemType) => {
  const items = getStoredItems();
  const filteredItems = items.filter(i => !(i.id === itemId && i.type === itemType));
  if (items.length !== filteredItems.length) {
      saveStoredItems(filteredItems);
      console.log(`Removed item ${itemId} (${itemType}) from library.`);
  } else {
      console.log(`Item ${itemId} (${itemType}) not found in library for removal.`);
  }
};

// Check if an item is in the library
export const isItemInLibrary = (itemId, itemType) => {
  const items = getStoredItems();
  return items.some(i => i.id === itemId && i.type === itemType);
}; 