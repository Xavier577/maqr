#!/usr/bin/env node
import {Command} from "commander";
import {cli} from "./cli";

cli(new Command()).catch(console.error)

