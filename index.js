const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()

//middleware
app.use(express.json())
app.use(bodyParser.json())

//Connecting MongoDB with mongoose
mongoose.connect('mongodb://localhost:27017/mongo-test')
  .then(() => 
    console.log({message: 'Connected to mongo'})
).catch((err) => console.error('Connection failed..', err))


// Define a Mongoose schema for courses
const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  units: {
    type: Number,
    required: true
  },
  tag: {
    type: [String],
    required: true
  },
});

const yearSchema = new mongoose.Schema(
  {
    "1st Year": [courseSchema],
    "2nd Year": [courseSchema],
    "3rd Year": [courseSchema],
    "4th Year": [courseSchema],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", yearSchema);

  //loging all the information of my collection(courses)
  app.get('/all-courses', async (req, res) => {
    try {
      const allCourses = await Course.find({});
      console.log('All Courses:', allCourses);
      res.json(allCourses);
    } catch (error) {
      console.error('Error retrieving all courses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
/*Official Requirements:
1. Retrieve all published backend courses and sort them alphabetically by their names
2. Select and extract the name and specialization of each course.
3. Retrieve all published BSIS and BSIT courses from the curriculum.*/

// Retrieve all published backend courses and sort them alphabetically by their names
app.get("/CourseSort", async (req, res) => {
  try {
    const courseYears = await Course.find();

    // Collecting all years
    const allCourses = courseYears.reduce((courses, year) => {
      ["1st Year", "2nd Year", "3rd Year", "4th Year"].forEach(yearKey => {
        if (year[yearKey]) {
          courses.push(...year[yearKey]);
        }
      });
      return courses;
    }, []);

    // Sorting name in aphabetical form
    const sortedCourses = allCourses.sort((a, b) => a.description.localeCompare(b.description));
    res.json(sortedCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Retrieve all published courses and extract their name and specialization

// Retrieve all published BSIS and BSIT courses
app.get("/BSITandBSIScourses", async (req, res) => {
  try {
    const courses = (await Course.find()).flatMap(year => ["1st Year", "2nd Year", "3rd Year", "4th Year"].flatMap(yearKey => year[yearKey] || []));
    
    const descriptionsAndTags = courses
      .filter(course => course.tag.includes("BSIT") || course.tag.includes("BSIS"))
      .map(({ description, tag }) => ({ description, tag }));

    res.json(descriptionsAndTags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//setting-up the port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`listening to port: ${PORT}`)
})