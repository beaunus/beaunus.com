import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

import { HighlightedLink } from "../../components/HighlightedLink";
import { Segment } from "../../components/Segment";

const BlogIndex: NextPage = () => (
	<>
		<Head>
			<title>Blog | Beaunus</title>
		</Head>
		<div className="flex flex-col grow gap-2">
			<div className="text-2xl font-semibold text-center text-cyan-700">
				Blog
			</div>
			<Segment>
				<div className="flex flex-wrap gap-5 items-center">
					<div className="text-xl font-semibold text-purple-800 whitespace-nowrap">
						<HighlightedLink href="/blog/poisson">
							Poisson Process
						</HighlightedLink>
					</div>
					<div>
						&quot;The thing about a Poisson process (a purely random process) is
						that events seem to cluster.&quot; -- Steven Pinker
					</div>
				</div>
			</Segment>
		</div>
	</>
);

export default BlogIndex;
