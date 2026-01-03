// Navigate suggestions with keyboard
  const navigateSuggestions = (direction) => {
    const currentFocus = document.activeElement;
    const suggestionItems = Array.from(document.querySelectorAll('[data-suggestion]'));
    const currentIndex = suggestionItems.indexOf(currentFocus);
    
    let newIndex;
    if (direction === 1) {
      newIndex = currentIndex < suggestionItems.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : suggestionItems.length - 1;
    }
    
    if (suggestionItems[newIndex]) {
      suggestionItems[newIndex].focus();
    }
  };

// Handle search actions
  const handleSearchAction = () => {
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (addressInput.trim()) {
      if (addressInput.includes(",")) {
        handleMultiSearch();
      } else {
        geocodeAddress();
      }
    }
  };