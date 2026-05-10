import {app} from "./src/index.js"
import connectDB from "./src/db/db.js"

connectDB()

app.listen(5000,()=>{
    console.log("Server is running in port 5000")
})