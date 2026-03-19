import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({

});
const ProfileModel = mongoose.model("Profile", ProfileSchema);
export default ProfileModel;