User experience

 - Connecting two components is not intuitive. It is unclear where
   should the user click - clicking at small circle at the end of
   element changes the cursor to drag pointer. There seems to be no live
   feedback or snapping to indicate that the connecting has happened
   successfully. Study UI experience of Google drawings to draw
   inspiration
 - How does the user pan the document? Space + drag didnt work and didnt see a UI element. To let the user see things around the canvas, inspiration can be drawn from Moqups UI
 -  Connecting to farther edge of a resistor creates a strikethrough line through the resistor which looks odd. Alternatively, we can also connect elements through a longer non-overlapping path.

Code structure
- From my experience, there are three levels of hierarchy to create re-usable elements. Components, Containers, Pages. Components are lower level abstractions which are not usable by themselves. For example - Buttons, Modals, Video player etc. Containers group components and define their flow, are they aligned horizontally, how do they align on phone etc. They can also make network calls and pass on the data to components. Pages are tied to routes - they consists to multiple containers generally flowing from top to bottom. They make network calls for data which may be required across containers. We can consider if we want to follow a similar scheme. 
- We can use folders for component name and use index.ts and css for naming. This may lead to cleaner structure.
- Network calls need error handling. The code needs more comments.
- Don't want to party spoiler but IMO Three JS is an overkill for this project. We don't need full fledged 3D environment with camera, shaders etc. to build this application. Something like SVG JS would have sufficed. https://svgjs.com/docs/3.0/ SVG DOM is well encapsulated, elements are easy to select and manipulate
- Should we set up hot reloading?
- Is this right behaviour? - https://imgur.com/13W4MUv
- Interesting to see that elements move to corrected position if placed on top of another element. 