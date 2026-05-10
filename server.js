import {app} from "./src/index.js"
import connectDB from "./src/db/db.js"

connectDB()
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log("Server is running")
})