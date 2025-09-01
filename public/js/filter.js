let buttons = document.querySelectorAll(".filter");

// Add click listeners to all filter buttons
buttons.forEach(button => {
  button.addEventListener("click", () => {
    // remove active class from all buttons
    buttons.forEach(btn => btn.classList.remove("filter-active"));

    const category = button.children[1].innerText;

    if (category === "all") {
      window.location.href = "/listing"; 
    } else {
      window.location.href = `/listing?category=${category}`;
    }

    // add active class to clicked button
    button.classList.add("filter-active");

    // ✅ save the clicked category in sessionStorage
    // sessionStorage.setItem("activeCategory", category);
  });
});

// // ✅ On page load, restore the active class
// const savedCategory = sessionStorage.getItem("activeCategory");

// if (savedCategory) {
//   buttons.forEach(button => {
//     const category = button.children[1].innerText;
//     if (category === savedCategory) {
//       button.classList.add("filter-active");
//     }
//   });
// }
