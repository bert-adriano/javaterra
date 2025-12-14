// Javaterra - Main JavaScript File
// Add your JavaScript functionality here

// Example: Smooth scrolling for navigation links
document.addEventListener("DOMContentLoaded", function () {
  // Add smooth scroll behavior to anchor links
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#" && href !== "") {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });
});
