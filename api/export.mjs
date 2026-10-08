import handler from "../netlify/functions/export.mjs";
import { adapt } from "./_handler.mjs";
export default adapt(handler);
