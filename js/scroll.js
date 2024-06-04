// Select the list items and slides
const listItems = document.querySelectorAll('aside li');
const slides = document.querySelectorAll('.sections');

// Add an event listener for scroll events
window.addEventListener('scroll', () => {
  // Find the currently visible slide
  let currentSlide = null;
  for (const sections of slides) {
    const rect = sections.getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= window.innerHeight) {
      currentSlide = sections;
      break;
    }
  }

  // Update the active link
  if (currentSlide) {
    const slideNumber = currentSlide.getAttribute('data-slide');
    for (const listItem of listItems) {
      if (listItem.getAttribute('data-slide') === slideNumber) {
        listItem.classList.add('active');
      } else {
        listItem.classList.remove('active');
      }
    }
  }
});