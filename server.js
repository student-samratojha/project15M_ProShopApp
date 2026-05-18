const app = require("./src/app");
const connectDB = require("./src/db/db");

const port = process.env.PORT || 3000;

// Connect to Database before starting server
connectDB().then(() => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
}).catch(err => {
  console.error("Database connection failed", err);
  process.exit(1);
});