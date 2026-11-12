# Small student character atlas

- Generated with the built-in `image_gen.imagegen` tool in one call, with `transparent_background: true`.
- Original: `students-v1.png`, 1774 × 887, RGBA, eight cells in a 4 × 2 atlas.
- Browser asset: `students-v1.webp`, lossless format conversion of the original PNG; alpha preserved.
- No painting, cropping, or post-generation retouching was performed.
- Characters are fictional students. No existing game's characters, named artists, real people, or logos were requested.
- CSS displays each square cell through background positioning. Visible sprite sizes are 30–72 CSS pixels; wrapper height includes 8 pixels of animation clearance.

| Cell index | Figure | Game use |
| --- | --- | --- |
| 0 | Short-haired boy, sage PE shirt | 도윤 |
| 1 | Girl with bob and closed book | 서윤 |
| 2 | Boy with glasses and navy sweater | 지민 |
| 3 | Girl with ponytail and sage hoodie | 유진 |
| 4 | Girl with hair clip and mustard cardigan | 하늘 |
| 5 | Boy with side part and coral shirt | 시온 |
| 6 | Boy in white school shirt | Male player |
| 7 | Girl in white school shirt | Female player |

## Generation prompt

Use case: stylized-concept.
Asset type: ONE transparent sprite atlas for a very simple school-life idle simulation game, not a poster and not a scene.
Create exactly EIGHT tiny full-body cartoon teenage student game sprites in a mathematically even grid: TWO rows and FOUR columns, on a landscape 2:1 transparent canvas. Every cell is square. Character centers at horizontal 12.5%,37.5%,62.5%,87.5% and vertical25%,75%. Same scale and same foot baseline within each cell. Keep each character fully contained inside its own cell with generous transparent padding, no touching or overlap. No visible grid or labels.
Style: deliberately extremely SIMPLE flat 2D mobile idle-game characters, two-head-tall body proportions, rounded big heads, tiny dot eyes and one small simple mouth, short chunky arms and legs, uniform crisp thick dark brown-black outlines. SOLID FLAT fills only, almost no internal detail. Looks like a small hand-drawn game icon at 64 pixels, not polished anime, not a painting, not 3D.
Colors: subdued sage green, navy, ivory white, muted mustard, coral accents. Modest everyday school clothes and sneakers, with simple different hairstyles. No brands.
Exact ordering from left to right:
Top row: (0) friendly short-black-haired boy in white and sage PE shirt; (1) girl with dark shoulder-length bob in ivory sweatshirt holding a small closed book; (2) boy with short wavy dark hair and simple round glasses wearing navy sweater; (3) girl with brown ponytail wearing sage hoodie.
Bottom row: (4) girl with short black hair and one small hair clip in pale mustard cardigan; (5) boy with neat side-parted brown hair in muted coral T-shirt; (6) male player character with simple black fringe in a white school shirt and navy trousers; (7) female player character with a short dark bob in white school shirt and navy trousers.
Every sprite faces viewer, relaxed standing pose, friendly neutral expression. All fictional same-age secondary-school students, no likeness to real people.
Constraints: true alpha TRANSPARENT background everywhere outside the characters; no environment, no objects outside cells, no gradients, no lighting effects, no grain, no texture, no shadows, no glow, no painterly detail, no large anime eyes, no text, no letters, no numbers, no watermark, no frame, no photorealism. This is a single aligned game spritesheet, so exact 4x2 spacing is essential.
