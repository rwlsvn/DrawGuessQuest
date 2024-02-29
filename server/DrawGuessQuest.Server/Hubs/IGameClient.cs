using DrawGuessQuest.Server.Models;

namespace DrawGuessQuest.Server.Hubs
{
    public interface IGameClient
    {
        Task PlayerJoinGame(PlayerInfo player);
        Task PlayerLeftGame(Guid id);
        Task DrawPainting(List<DrawnLine> drawingLines);
        Task PlayersInfo(List<PlayerInfo> players);
        Task DrawLine(DrawnLine drawModel);
        Task ClearPainting();
        Task ReceiveMessage(string username, string message);
        Task NewTurn();
        Task NotifyWin(string winnerName, string word);
        Task NewPainter(string painterName);
        Task NotifyPainter();
        Task SetWord(int wordLetterCount);
        Task RoundStarted();
        Task RemainingTimeMilliseconds(int remainingTime);
    }
}
