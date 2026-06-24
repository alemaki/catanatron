import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { GridLoader } from "react-spinners";
import { createGame, getModels } from "../utils/apiClient";

import "./HomePage.scss";

const GameMode = Object.freeze({
  HUMAN_VS_CATANATRON: "HUMAN_VS_CATANATRON",
  HUMAN_VS_MODEL: "HUMAN_VS_MODEL",
  RANDOM_BOTS: "RANDOM_BOTS",
  CATANATRON_BOTS: "CATANATRON_BOTS",
});

type GameModeType = (typeof GameMode)[keyof typeof GameMode];

function getPlayers(
  gameMode: GameModeType,
  numPlayers: number,
  modelName?: string
) {
  switch (gameMode) {
    case GameMode.HUMAN_VS_CATANATRON: {
      const players = ["HUMAN"];
      for (let i = 1; i < numPlayers; i++) players.push("CATANATRON");
      return players;
    }
    case GameMode.HUMAN_VS_MODEL:
      return ["HUMAN", `MODEL:${modelName}`];
    case GameMode.RANDOM_BOTS:
      return Array(numPlayers).fill("RANDOM");
    case GameMode.CATANATRON_BOTS:
      return Array(numPlayers).fill("CATANATRON");
    default:
      throw new Error("Invalid Game Mode");
  }
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getModels().then((names) => {
      setModels(names);
      if (names.length > 0) setSelectedModel(names[0]);
    });
  }, []);

  const handleCreateGame = async (gameMode: GameModeType) => {
    setLoading(true);
    const players = getPlayers(gameMode, numPlayers, selectedModel);
    const gameId = await createGame(players);
    setLoading(false);
    navigate("/games/" + gameId);
  };

  return (
    <div className="home-page">
      <h1 className="logo">Catanatron</h1>

      <div className="switchable">
        {!loading ? (
          <>
            <ul>
              <li>OPEN HAND</li>
              <li>NO CHOICE DURING DISCARD</li>
            </ul>
            <div className="player-count-selector">
              <div className="player-count-label">Number of Players</div>
              <div className="player-count-buttons">
                {[2, 3, 4].map((value) => (
                  <Button
                    key={value}
                    variant="contained"
                    onClick={() => setNumPlayers(value)}
                    className={`player-count-button ${
                      numPlayers === value ? "selected" : ""
                    }`}
                  >
                    {value} Players
                  </Button>
                ))}
              </div>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleCreateGame(GameMode.HUMAN_VS_CATANATRON)}
            >
              Play against Catanatron
            </Button>
            {models.length > 0 && (
              <>
                <FormControl
                  size="small"
                  sx={{ minWidth: 260, marginBottom: "8px" }}
                >
                  <InputLabel sx={{ color: "white" }}>Model</InputLabel>
                  <Select
                    value={selectedModel}
                    label="Model"
                    onChange={(e) => setSelectedModel(e.target.value)}
                    sx={{
                      color: "white",
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.5)",
                      },
                      ".MuiSvgIcon-root": { color: "white" },
                    }}
                  >
                    {models.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleCreateGame(GameMode.HUMAN_VS_MODEL)}
                >
                  Play vs My Model
                </Button>
              </>
            )}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleCreateGame(GameMode.RANDOM_BOTS)}
            >
              Watch Random Bots
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleCreateGame(GameMode.CATANATRON_BOTS)}
            >
              Watch Catanatron
            </Button>
          </>
        ) : (
          <GridLoader className="loader" color="#ffffff" size={60} />
        )}
      </div>
    </div>
  );
}
