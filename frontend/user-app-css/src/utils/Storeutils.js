// utils/storeUtils.js
export const isStoreOpen = (store) => {
  if (!store || !store.openingTime || !store.closingTime) return true;

  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMinute] = store.openingTime.split(':').map(Number);
  const openTotalMinutes = openHour * 60 + openMinute;

  const [closeHour, closeMinute] = store.closingTime.split(':').map(Number);
  const closeTotalMinutes = closeHour * 60 + closeMinute;

  if (openTotalMinutes < closeTotalMinutes) {
    return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
  }
  return currentTotalMinutes >= openTotalMinutes || currentTotalMinutes < closeTotalMinutes;
};