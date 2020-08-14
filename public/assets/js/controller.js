function toggleNavbar() {
  if (navbarStatus) {
    navbarStatus = false;
    actualNav.style.display = "none";
    navButton.style.display = "block";
  } else {
    navbarStatus = true;
    actualNav.style.display = "block";
    navButton.style.display = "none";
  }
}

var navbarStatus = false;
var actualNav = document.getElementById("toggleNav");
var navButton = document.getElementById("navbuttonWrapper");
