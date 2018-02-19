---
title: 'Async Modules Supporting ES5 & ES6 with Control Flow'
tags:
 - ES5
 - ES6
 - promise
 - Promise
 - async
 - javascript
 - task
 - queue
 - requestAnimationFrame
 - d3
 - js
 - biojs
 - bionode
 - pause
 - resume
 - module
 - Control Flow
authors:
 - name: Ibrahim Tanyalcin
   orcid: 0000-0003-0327-5096
   affiliation: 1
affiliations:
 - name: Vrije Universiteit Brussel
   index: 1
date: 19 February 2018
bibliography: paper.bib
---

# Summary

Javascript has evolved immensely the last 20 years with its usage spreading across multiple branches of science. This had led to more complex UI designs to meet user demands as in case of scientific data visualizations etc. The expansion of utility libraries has raised the need for a module system. 

Many module proposals/implementations are in use today, including the ES6 import/export syntax. Taskq differentiates by giving the user the control over the pace of execution of modules and other dynamically imported scripts while taking advantage of the async attribute. 

Taskq uses a combination of Promises with requestAnimationFrame (rAF) and falls back to rAF on older browsers including ie9. Since it does not dictate anything else about the app structure, it can be used in the browser with other technologies. It's about 6kB (as of version 2.1.4) minimized and does not need any transpiling to use in older browsers.

Taskq concept can make it easier to implement complex workflows in the browsers which frequently required by scientific software.

# References