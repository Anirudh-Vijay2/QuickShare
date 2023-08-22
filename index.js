const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

const UserRouts = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Display the shared image using a single route with a parameter
app.get('/image/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imageRoute = UserRouts.find(route => route.imageName === imageName);
  if (imageRoute) {
    res.render('share.ejs', { image: imageRoute.image });
  } else {
    res.status(404).send('Image not found');
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/');
  },
  filename: (req, file, cb) => {
    const CrrDateForPathAndName = Date.now();
    const fileNameAndPath = CrrDateForPathAndName + '-' + file.originalname;
    UserRouts.push({
      imageName: `${CrrDateForPathAndName}`,
      image: `/images/${fileNameAndPath}`
    });
    cb(null, fileNameAndPath);
  }
});

const imageFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: imageFilter
});
app.get('/success', (req, res)=>{
  res.render('generated.ejs', {url: `/image/${UserRouts[UserRouts.length - 1].imageName}`})
})
app.post('/upload', upload.single('file'), (req, res) => {
  res.redirect('/success')
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
