module.exports = {
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        accent: "rgb(var(--accent))",
        "accent-light": "rgb(var(--accent-light))",
        "accent-dark": "rgb(var(--accent-dark))",
        // Add more custom colors
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(45deg, rgb(var(--accent)), rgb(var(--accent-light)) 30%, grey 60%)",
      },
    },
  },
  plugins: [
    require("flowbite/plugin")({
      sharts: true,
    }),
    // Add other plugins if needed
  ],
};
