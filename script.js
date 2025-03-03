class WeatherAnimation {
  constructor() {
    this.initSunAnimation();
    this.initRainAnimation();
    this.initSnowAnimation();
    this.initWindAnimation();
  }

  initSunAnimation() {
    const sunCard = document.querySelector(".sun-card");
    const sun = sunCard.querySelector(".sun");

    // Create sun rays
    for (let i = 0; i < 8; i++) {
      const ray = document.createElement("div");
      ray.className = "sun-ray";
      ray.style.transform = `rotate(${i * 45}deg)`;
      sun.appendChild(ray);
    }
  }

  initRainAnimation() {
    const rainCard = document.querySelector(".rain-card");
    this.createMultipleElements({
      parent: rainCard,
      className: "raindrop",
      count: 30,
      callback: (element) => {
        element.style.left = `${Math.random() * 100}%`;
        element.style.animationDelay = `${Math.random() * 1.5}s`;
        element.style.opacity = Math.random() * 0.4 + 0.6;
      },
    });
  }

  initSnowAnimation() {
    const snowCard = document.querySelector(".snow-card");
    this.createMultipleElements({
      parent: snowCard,
      className: "snowflake",
      count: 30,
      callback: (element) => {
        element.style.left = `${Math.random() * 100}%`;
        element.style.animationDelay = `${Math.random() * 6}s`;
        element.style.opacity = Math.random() * 0.4 + 0.6;
        element.style.width = `${Math.random() * 4 + 3}px`;
        element.style.height = element.style.width;
      },
    });
  }

  initWindAnimation() {
    const windCard = document.querySelector(".wind-card");
    this.createMultipleElements({
      parent: windCard,
      className: "wind-line",
      count: 8,
      callback: (element, index) => {
        element.style.top = `${30 + index * 35}px`;
        element.style.width = `${50 + Math.random() * 100}px`;
        element.style.animationDelay = `${Math.random() * 2}s`;
      },
    });
  }

  createMultipleElements({ parent, className, count, callback }) {
    for (let i = 0; i < count; i++) {
      const element = document.createElement("div");
      element.className = className;
      if (callback) callback(element, i);
      parent.appendChild(element);
    }
  }
}

// Initialize weather animations when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherAnimation();
});
