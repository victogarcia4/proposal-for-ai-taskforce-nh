import handler from "../netlify/functions/consultation.mjs";
import { adapt } from "./_handler.mjs";

export default adapt(handler);
