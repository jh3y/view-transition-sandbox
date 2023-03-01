import { getPageContent, onLinkNavigate, transitionHelper } from '../../scripts/view-transition-utils.js'
import gsap from 'gsap'
const WIPE_SPEED = 250
const STOPOVER = 200
const STAGGER_STEP = 100

onLinkNavigate(async ({ toPath }) => {
  // Do the stuff in here when you want to switch to a new view...
  const content = await getPageContent(toPath);
  // Grid lines
  const LINE_COUNT = 5
  const LINES = []
  for (let l = 0; l < LINE_COUNT; l++) {
    const LINE = Object.assign(document.createElement('div'), {
      style: `
        contain: paint;
        view-transition-name: line-${l};
        position: fixed;
        top: ${l * (100 / LINE_COUNT)}vh;
        left: 0;
        right: 0;
        height: ${(100 / LINE_COUNT) + 5}vh;
        background: hsl(${gsap.utils.mapRange(0, LINE_COUNT, 0, 359, l)} 90% 80%);
        transform-origin: 50% 50%;
      `,
    });
    LINES.push(LINE)
  }
  
  const transition = transitionHelper({
    async updateDOM() {
      // This is a pretty heavy-handed way to update page content.
      // In production, you'd likely be modifying DOM elements directly,
      // or using a framework.
      // innerHTML is used here just to keep the DOM update super simple.
      document.body.innerHTML = content;
      // Add the lines to the new body and remove them on animation finish...
      // Removes the flicker...
      for (const LINE of LINES) document.body.append(LINE)
    }
  });
  
  // What if you create a popover and animate that?
  // What happens during the transition
  transition.ready.then(async () => {
    // Just holds things while you do what you want...
    const holdAnim = document.documentElement.animate(
      {},
      {
        duration: 60_000,
        pseudoElement: "::view-transition-group(root)",
      }
    );

    const WIPE_FRONT = [] 
    for (let i = 0; i < LINE_COUNT; i++) {
      WIPE_FRONT.push(document.documentElement.animate(
        [
          {
            translate: '-100% 0',
          },
          {
            translate: '0 0'
          }
        ],
        {
          delay: i * STAGGER_STEP,
          duration: WIPE_SPEED,
          fill: 'both',
          pseudoElement: `::view-transition-group(line-${i})`,
        }
      ).finished)  
    }
    await Promise.all(WIPE_FRONT)
    // Switch the underlying content
    const switcheroo = document.documentElement.animate(
      [
        {
          scale: 0,
        }
      ],
      {
        fill: 'both',
        duration: STOPOVER,
        pseudoElement: "::view-transition-old(root)"
      }
    )
    await switcheroo.finished

    const WIPE_BACK = [] 
    for (let i = 0; i < LINE_COUNT; i++) {
      WIPE_BACK.push(document.documentElement.animate(
        [
          {
            translate: '0 0',
          },
          {
            translate: '100% 0'
          }
        ],
        {
          delay: i * STAGGER_STEP,
          duration: WIPE_SPEED,
          fill: 'both',
          pseudoElement: `::view-transition-group(line-${i})`,
        }
      ).finished)  
    }
    await Promise.all(WIPE_BACK)
    // Finished so you can blow it all up.
    holdAnim.finish()
    for (const LINE of LINES) LINE.remove()
  })
});
