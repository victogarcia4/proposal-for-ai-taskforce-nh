import { createFileRoute } from "@tanstack/react-router";
import { Consultation } from "../components/Consultation";

export const Route = createFileRoute("/")({ component: Consultation });
