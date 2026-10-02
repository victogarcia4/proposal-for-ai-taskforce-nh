import handler from "../netlify/functions/attachment.mjs";
import { adapt } from "./_handler.mjs";

export default adapt(handler);
