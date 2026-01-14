import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';

const BubbleMap = ({ data, width = 800, height = 600 }) => {
    const svgRef = useRef(null);

    // Process data logic
    const processedData = useMemo(() => {
        return (data || [])
            .filter(coin => coin.market_cap && coin.market_cap > 0 && coin.price_change_percentage_24h != null)
            .sort((a, b) => b.market_cap - a.market_cap)
            .slice(0, 80); // Reduce count slightly for cleaner look
    }, [data]);

    useEffect(() => {
        if (!svgRef.current || processedData.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // --- Gradients ---
        const defs = svg.append("defs");

        // The "Dark Core, Colored Rim" look
        // We simulate this by having index 0 be black/dark, and index 100 be the color

        // Green Gradient
        const greenGrad = defs.append("radialGradient")
            .attr("id", "grad-green-rim")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%")
            .attr("fx", "50%") // Focal point center
            .attr("fy", "50%");

        greenGrad.append("stop").attr("offset", "40%").attr("stop-color", "#0a0a0a"); // Dark Center
        greenGrad.append("stop").attr("offset", "85%").attr("stop-color", "#064025"); // Darker Green transition
        greenGrad.append("stop").attr("offset", "100%").attr("stop-color", "#16c784"); // Bright Rim

        // Red Gradient
        const redGrad = defs.append("radialGradient")
            .attr("id", "grad-red-rim")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%")
            .attr("fx", "50%")
            .attr("fy", "50%");

        redGrad.append("stop").attr("offset", "40%").attr("stop-color", "#0a0a0a"); // Dark Center
        redGrad.append("stop").attr("offset", "85%").attr("stop-color", "#4a0505"); // Darker Red transition
        redGrad.append("stop").attr("offset", "100%").attr("stop-color", "#ea3943"); // Bright Rim

        // Neutral Gradient
        const grayGrad = defs.append("radialGradient")
            .attr("id", "grad-neutral-rim")
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "50%");

        grayGrad.append("stop").attr("offset", "40%").attr("stop-color", "#0a0a0a");
        grayGrad.append("stop").attr("offset", "100%").attr("stop-color", "#4a4a4a");

        // Glow Filters (optional, adds extra 'pop' to the text/rim)
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // --- Scales ---
        const minCap = d3.min(processedData, d => d.market_cap);
        const maxCap = d3.max(processedData, d => d.market_cap);

        // Adjust scale to make bubbles larger and easier to read like the screenshot
        const radiusScale = d3.scaleSqrt()
            .domain([minCap, maxCap])
            .range([30, 110]); // Larger bubbles

        // Distribute bubbles - mostly center with some in corners
        const nodes = processedData.map((d, i) => {
            const r = radiusScale(d.market_cap);
            let x, y;

            // Place some bubbles (small ones) in corners
            if (i >= processedData.length - 12) {
                // Last 12 bubbles go to corners and edges
                const cornerIndex = i - (processedData.length - 12);
                const corners = [
                    { x: 80, y: 80 },           // top-left
                    { x: width - 80, y: 80 },    // top-right
                    { x: 80, y: height - 80 },   // bottom-left
                    { x: width - 80, y: height - 80 }, // bottom-right
                    { x: width / 4, y: 60 },     // top-left-middle
                    { x: width * 0.75, y: 60 },  // top-right-middle
                    { x: width / 4, y: height - 60 },  // bottom-left-middle
                    { x: width * 0.75, y: height - 60 }, // bottom-right-middle
                    { x: 60, y: height / 3 },    // left-top
                    { x: 60, y: height * 0.66 }, // left-bottom
                    { x: width - 60, y: height / 3 },  // right-top
                    { x: width - 60, y: height * 0.66 } // right-bottom
                ];
                const corner = corners[cornerIndex % corners.length];
                x = corner.x + (Math.random() - 0.5) * 40;
                y = corner.y + (Math.random() - 0.5) * 40;
            } else {
                // Rest of bubbles around center with spread
                const angle = (i / (processedData.length - 12)) * Math.PI * 2 + Math.random() * 0.5;
                const distance = 50 + Math.random() * Math.min(width, height) * 0.3;
                x = width / 2 + Math.cos(angle) * distance + (Math.random() - 0.5) * 80;
                y = height / 2 + Math.sin(angle) * distance + (Math.random() - 0.5) * 80;
            }

            return { ...d, r, x, y };
        });

        // --- Simulation ---
        const simulation = d3.forceSimulation(nodes)
            .velocityDecay(0.3) // Moderate friction
            .alphaMin(0.001) // Very low minimum so simulation keeps running
            .alphaDecay(0.001) // Very slow decay - keeps bubbles moving
            .force("charge", d3.forceManyBody().strength(5))
            .force("collide", d3.forceCollide().radius(d => d.r + 8).strength(0.95).iterations(3))
            // Gentle centering
            .force("x", d3.forceX(width / 2).strength(0.02))
            .force("y", d3.forceY(height / 2).strength(0.02))
            // Random jiggle force to keep bubbles moving
            .force("jiggle", () => {
                nodes.forEach(d => {
                    d.vx += (Math.random() - 0.5) * 0.3;
                    d.vy += (Math.random() - 0.5) * 0.3;
                });
            })
            // Keep bubbles in bounds
            .force("bounds", () => {
                nodes.forEach(d => {
                    const pad = d.r + 10;
                    if (d.x < pad) d.x = pad;
                    if (d.x > width - pad) d.x = width - pad;
                    if (d.y < pad) d.y = pad;
                    if (d.y > height - pad) d.y = height - pad;
                });
            })
            .on("tick", ticked);

        const g = svg.append("g");

        // Draggable container
        const node = g.selectAll(".bubble")
            .data(nodes)
            .join("g")
            .attr("class", "bubble")
            .style("cursor", "grab")
            .style("transition", "none") // No CSS transition - instant movement
            .style("will-change", "transform") // Optimize for transform changes
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // 1. Circle Background
        node.append("circle")
            .attr("r", d => d.r)
            .style("fill", d => {
                const change = d.price_change_percentage_24h;
                if (change == null) return "url(#grad-neutral-rim)";
                return change >= 0 ? "url(#grad-green-rim)" : "url(#grad-red-rim)";
            })
            // Add a thin stroke of the color to define the edge cleanly
            .style("stroke", d => {
                const change = d.price_change_percentage_24h;
                if (change == null) return "#4a4a4a";
                return change >= 0 ? "#16c784" : "#ea3943";
            })
            .style("stroke-width", "1px")
            .style("stroke-opacity", 0.6);

        // Clip Path for Image
        node.append("clipPath")
            .attr("id", (d, i) => `clip-${i}`)
            .append("circle")
            .attr("r", d => d.r);

        // 2. Logo (Top Center)
        node.append("image")
            .attr("xlink:href", d => d.image)
            .attr("x", d => -d.r * 0.25) // Center horizontally
            .attr("y", d => -d.r * 0.70) // Move to top
            .attr("width", d => d.r * 0.5)
            .attr("height", d => d.r * 0.5)
            .attr("clip-path", (d, i) => `url(#clip-${i})`)
            .style("opacity", 0.9);

        // 3. Symbol (Center, Large, Bold)
        node.append("text")
            .attr("dy", "0.15em")
            .style("text-anchor", "middle")
            .text(d => d.symbol.toUpperCase())
            .style("font-family", "'Inter', system-ui, sans-serif")
            .style("font-weight", "900") // Heavy bold
            .style("fill", "#ffffff")
            .style("font-size", d => {
                const len = d.symbol.length;
                // More aggressive scaling for smaller bubbles
                const baseSize = d.r * 0.35;
                // Reduce for longer symbols
                const sizeFromLength = (d.r * 1.4) / (0.6 * Math.max(len, 3));
                // Clamp between min and calculated size
                const finalSize = Math.max(8, Math.min(baseSize, sizeFromLength));
                return `${finalSize}px`;
            })
            .style("pointer-events", "none")
            .style("text-shadow", "0 2px 4px rgba(0,0,0,0.3)"); // Subtle shadow for readability

        // 4. Percentage (Bottom, Regular weight)
        node.append("text")
            .attr("dy", "1.6em") // Slightly lower
            .style("text-anchor", "middle")
            .text(d => {
                const change = d.price_change_percentage_24h;
                return change !== null && change !== undefined ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : ''; // One decimal is often cleaner for map
            })
            .style("font-family", "'Inter', system-ui, sans-serif")
            .style("font-weight", "600")
            .style("font-size", d => `${Math.max(6, d.r * 0.22)}px`) // Proportional sizing with min
            .style("fill", "#ffffff")
            .style("opacity", 0.9)
            .style("pointer-events", "none");

        // Tooltip
        node.append("title")
            .text(d => `${d.name}\nPrice: $${d.current_price}\nChange: ${d.price_change_percentage_24h?.toFixed(2)}%`);


        function ticked() {
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        }

        function dragstarted(event, d) {
            // Keep simulation running but with high alpha for collision
            simulation.alphaTarget(1).restart();
            d.fx = d.x;
            d.fy = d.y;
            d3.select(this).style("cursor", "grabbing");
        }

        function dragged(event, d) {
            // Set fixed position - simulation will handle collision
            d.fx = event.x;
            d.fy = event.y;
            // Also directly update for instant visual feedback
            d.x = event.x;
            d.y = event.y;
            d3.select(this).attr("transform", `translate(${event.x},${event.y})`);
        }

        function dragended(event, d) {
            simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            d3.select(this).style("cursor", "grab");
        }

        return () => simulation.stop();

    }, [processedData, width, height]);

    return (
        <div className="w-full h-full bg-[#050505] relative overflow-hidden">
            {/* Subtle background glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none" />

            <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full relative z-10"
                style={{ overflow: 'visible' }}
            />
        </div>
    );
};

export default BubbleMap;
