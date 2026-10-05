using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class FrameProcessor {
    public static void Main(string[] args) {
        string inputPath = @"C:\Users\REDECS2\.gemini\antigravity-ide\brain\d41461d9-8052-46ff-94e3-3be1001735a0\.user_uploaded\media_1791207344278.jpg";
        string outputDir = @"d:\Documents\Image_Generator\public\frames";
        if (!Directory.Exists(outputDir)) {
            Directory.CreateDirectory(outputDir);
        }

        Console.WriteLine("Loading source image: " + inputPath);
        using (Bitmap srcBmp = new Bitmap(inputPath)) {
            int W = 1024;
            int H = 1536;

            // 1. Rescale to 1024x1536 with High Quality Bicubic
            Bitmap scaled = new Bitmap(W, H, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(scaled)) {
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.CompositingQuality = CompositingQuality.HighQuality;
                g.DrawImage(srcBmp, 0, 0, W, H);
            }

            // Lock bits for fast pixel processing
            int bytesPerPixel = 4;
            int totalPixels = W * H;

            // Define the 9 target colors
            // Format: Name, HueShift (-180..180), SatMultiplier, LumOffset (-1..1) or custom color mapping
            string[] colorNames = new string[] {
                "blue", "red", "yellow", "orange", "green", "cyan", "black", "white", "gray"
            };

            foreach (string colorName in colorNames) {
                Console.WriteLine("Generating frame for: " + colorName);
                Bitmap frame = (Bitmap)scaled.Clone();
                BitmapData bmpData = frame.LockBits(
                    new Rectangle(0, 0, W, H),
                    ImageLockMode.ReadWrite,
                    PixelFormat.Format32bppArgb
                );

                byte[] pixels = new byte[bmpData.Stride * H];
                Marshal.Copy(bmpData.Scan0, pixels, 0, pixels.Length);

                for (int y = 0; y < H; y++) {
                    int rowOffset = y * bmpData.Stride;
                    for (int x = 0; x < W; x++) {
                        int idx = rowOffset + x * bytesPerPixel;
                        byte b = pixels[idx];
                        byte g = pixels[idx + 1];
                        byte r = pixels[idx + 2];
                        byte a = pixels[idx + 3];

                        // --- A. ART WINDOW TRANSPARENCY ---
                        // Art window is in Y from 185 to 1118, X from 98 to 925
                        if (y >= 185 && y <= 1118 && x >= 98 && x <= 925) {
                            // Check if inside circle cutout at top-left
                            // Circle center ~(102, 115) with radius ~120
                            double distToCircle = Math.Sqrt(Math.Pow(x - 102, 2) + Math.Pow(y - 115, 2));

                            bool isPlaceholderGrey = (
                                Math.Abs(r - g) <= 18 &&
                                Math.Abs(r - b) <= 18 &&
                                Math.Abs(g - b) <= 18 &&
                                r >= 115 && r <= 175 &&
                                g >= 115 && g <= 175 &&
                                b >= 115 && b <= 175
                            );

                            if (isPlaceholderGrey) {
                                // Transparent
                                pixels[idx] = 0;
                                pixels[idx + 1] = 0;
                                pixels[idx + 2] = 0;
                                pixels[idx + 3] = 0;
                                continue;
                            }
                        }

                        // --- B. COLOR TINTING OF BACKGROUND (Preserving Gold/Metal) ---
                        // Identify gold: warm hue, r > b + 25, r > 90, g > b + 15
                        bool isGold = (r > b + 25 && g > b + 10 && r > 85);
                        
                        // If it's not gold and not transparent, it's the dark celestial background/panels
                        if (!isGold && a > 0) {
                            // Convert current background (mostly dark slate navy) to luminosity
                            double lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;

                            double nr = r;
                            double ng = g;
                            double nb = b;

                            switch (colorName) {
                                case "blue":
                                    // Original / Deep midnight sapphire
                                    nr = lum * 28.0;
                                    ng = lum * 48.0;
                                    nb = lum * 90.0;
                                    break;
                                case "red":
                                    // Crimson ruby / Dark wine
                                    nr = lum * 95.0;
                                    ng = lum * 22.0;
                                    nb = lum * 30.0;
                                    break;
                                case "yellow":
                                    // Warm deep amber / Sun bronze
                                    nr = lum * 90.0;
                                    ng = lum * 72.0;
                                    nb = lum * 20.0;
                                    break;
                                case "orange":
                                    // Fiery ember / terracotta
                                    nr = lum * 105.0;
                                    ng = lum * 48.0;
                                    nb = lum * 16.0;
                                    break;
                                case "green":
                                    // Deep forest emerald / nature
                                    nr = lum * 20.0;
                                    ng = lum * 75.0;
                                    nb = lum * 35.0;
                                    break;
                                case "cyan":
                                    // Astral sky / radiant celeste
                                    nr = lum * 20.0;
                                    ng = lum * 78.0;
                                    nb = lum * 105.0;
                                    break;
                                case "black":
                                    // Obsidian void / pure deep dark onyx
                                    nr = lum * 18.0;
                                    ng = lum * 18.0;
                                    nb = lum * 22.0;
                                    break;
                                case "white":
                                    // Pearl alabaster / sacred ivory
                                    // Increase luminance and give subtle pearlescent tone
                                    double wLum = 0.55 + lum * 0.42;
                                    nr = wLum * 235.0;
                                    ng = wLum * 232.0;
                                    nb = wLum * 225.0;
                                    break;
                                case "gray":
                                    // Neutral stone / slate (ideal for tokens)
                                    double gLum = lum * 65.0;
                                    nr = gLum;
                                    ng = gLum;
                                    nb = gLum;
                                    break;
                            }

                            pixels[idx] = (byte)Math.Min(255, Math.Max(0, (int)nb));
                            pixels[idx + 1] = (byte)Math.Min(255, Math.Max(0, (int)ng));
                            pixels[idx + 2] = (byte)Math.Min(255, Math.Max(0, (int)nr));
                        }
                    }
                }

                Marshal.Copy(pixels, 0, bmpData.Scan0, pixels.Length);
                frame.UnlockBits(bmpData);

                string outFilename = Path.Combine(outputDir, "frame_" + colorName + ".png");
                frame.Save(outFilename, ImageFormat.Png);
                Console.WriteLine("Saved: " + outFilename);

                // Also overwrite general.png and monster.png with blue default
                if (colorName == "blue") {
                    frame.Save(Path.Combine(outputDir, "general.png"), ImageFormat.Png);
                    frame.Save(Path.Combine(outputDir, "monster.png"), ImageFormat.Png);
                    frame.Save(Path.Combine(outputDir, "arcano.png"), ImageFormat.Png);
                }

                frame.Dispose();
            }

            scaled.Dispose();
        }

        Console.WriteLine("Finished generating all 9 color frames successfully!");
    }
}
