{
  description = "Development environment for Obsidian LLM plugin";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js and pnpm
            nodejs_20
            pnpm

            # TypeScript and other dev dependencies
            typescript
            nodePackages.typescript-language-server
            nodePackages.eslint
          ];

          shellHook = ''
            clear
            echo "🚀 Development environment for Obsidian LLM plugin"
            echo "📦 Using pnpm as package manager"
            echo ""
            echo "📊 Installed Versions:"
            echo "  Node.js: $(node --version)"
            echo "  pnpm: $(pnpm --version)"
            echo "  TypeScript: $(tsc --version)"
            echo "  ESLint: $(eslint --version)"
            echo ""
            echo "💻 Available commands:"
            echo "  - pnpm dev: Start development build"
            echo "  - pnpm build: Build for production"
            echo "  - pnpm version: Bump version"
            echo ""
            echo "----------------------------------------"
          '';
        };
      }
    );
} 