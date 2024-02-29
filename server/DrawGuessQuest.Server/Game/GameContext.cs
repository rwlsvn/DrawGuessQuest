using DrawGuessQuest.Server.Interfaces;
using DrawGuessQuest.Server.Models;

namespace DrawGuessQuest.Server.Game
{
    public class GameContext
    {
        private const int RoundDuration = 100000;
        private const int SetWordDuration = 10000;

        private const int GuesserScoreIncrement = 5;
        private const int PainterScoreIncrement = 3;

        private readonly IGameNotificationService _gameNotificationService;

        private Guid _id;
        private List<Player> _players;
        private Player _painter;
        private string _word = Guid.NewGuid().ToString();
        private List<DrawnLine> _drawnLines = new();

        private DateTime _roundStartTime;

        CancellationTokenSource _cancelGameTokenSource = new();
        CancellationTokenSource _cancelWordEnterTokenSource = new();

        public int UserCount { get => _players.Count; }

        public GameContext(Guid id, Player user, IGameNotificationService gameNotificationService)
        {
            _id = id;
            _gameNotificationService = gameNotificationService;
            _players = new List<Player>() { user };
            _painter = user;

            _roundStartTime = DateTime.Now;

            _cancelWordEnterTokenSource = new CancellationTokenSource();
            var wordEnterToken = _cancelWordEnterTokenSource.Token;

            _ = PassMoveAfterTimer(wordEnterToken);
        }

        public async Task AddNewPlayer(Player user)
        {
            _players.Add(user);
            List<PlayerInfo> usersInfo = _players.Select(user => new PlayerInfo
            {
                Id = user.Id,
                Username = user.Username,
                Score = user.Score
            }).ToList();

            var roundTime = DateTime.Now - _roundStartTime;
            int roundTimeMilliseconds = RoundDuration - (int)roundTime.TotalMilliseconds;

            var gameInfo = new GameInfo
            {
                Id = _id,
                Painter = _painter,
                DrawnLines = _drawnLines,
                Players = usersInfo,
                WordLength = _word.Length,
                RemainingTimeMilliseconds = roundTimeMilliseconds
            };

            await _gameNotificationService.PlayerJoinGameAsync(user, gameInfo);
        }

        public async Task RemovePlayer(string connectionId)
        {
            var user = _players.FirstOrDefault(x => x.ConnectionId == connectionId);
            _players.Remove(user);
            await _gameNotificationService.PlayerLeftGameAsync(_id, user.Id);
            if (user == _painter && _players.Count != 0)
            {
                _cancelGameTokenSource.Cancel();
                _cancelWordEnterTokenSource.Cancel();
                await SetNextTurn();
            }
        }

        public async Task DrawLine(string senderId, DrawnLine drawModel)
        {
            if (senderId == _painter.ConnectionId)
            {
                _drawnLines.Add(drawModel);
                await _gameNotificationService.DrawLineAsync(_id, _painter.ConnectionId, drawModel);
            }
        }

        public async Task ClearPainting(string senderConId)
        {
            if (senderConId == _painter.ConnectionId)
            {
                _drawnLines.Clear();
                await _gameNotificationService.ClearPainting(_id);
            }
        }

        public async Task CheckMessage(string senderConId, string message)
        {
            var user = _players.FirstOrDefault(x => x.ConnectionId == senderConId);
            await _gameNotificationService.ReceiveMessageAsync(_id, message, user.Username);

            if (senderConId != _painter.ConnectionId
                && string.Equals(message, _word, StringComparison.OrdinalIgnoreCase))
            {
                _cancelGameTokenSource.Cancel();

                user.Score += GuesserScoreIncrement;
                _painter.Score += PainterScoreIncrement;
                await _gameNotificationService.NotifyWinAsync(_id, user.Username, _word);
                await SetNextTurn();
            }
        }

        public async Task StartRound(string senderConId, string newWord)
        {
            if (_painter.ConnectionId == senderConId)
            {
                _cancelWordEnterTokenSource.Cancel();

                _word = newWord;
                await _gameNotificationService.RoundStartAsync(_id, newWord.Length);
                _roundStartTime = DateTime.Now;

                _cancelGameTokenSource = new CancellationTokenSource();
                var gameToken = _cancelGameTokenSource.Token;

                _ = EndRoundAfterTimer(gameToken);
            }
        }

        private async Task SetNextTurn()
        {
            int currentPainterIndex = _players.IndexOf(_painter);
            int nextPainterIndex = (currentPainterIndex + 1) % _players.Count;
            _painter = _players[nextPainterIndex];

            List<PlayerInfo> usersInfo = _players.Select(user => new PlayerInfo
            {
                Id = user.Id,
                Username = user.Username,
                Score = user.Score
            }).ToList();

            _drawnLines.Clear();
            _word = Guid.NewGuid().ToString();

            await _gameNotificationService.NewTurnAsync(_id, _painter, usersInfo);

            _cancelWordEnterTokenSource = new CancellationTokenSource();
            var wordEnterToken = _cancelWordEnterTokenSource.Token;

            _ = PassMoveAfterTimer(wordEnterToken);
        }

        private async Task PassMoveAfterTimer(CancellationToken cancellationToken)
        {
            try
            {
                await Task.Delay(SetWordDuration, cancellationToken);
                await SetNextTurn();
            }
            catch (TaskCanceledException) { }
        }

        private async Task EndRoundAfterTimer(CancellationToken cancellationToken)
        {
            try
            {
                await Task.Delay(RoundDuration, cancellationToken);
                await _gameNotificationService.NotifyWinAsync(_id, "", _word);
                await SetNextTurn();
            }
            catch (TaskCanceledException) { }
        }
    }
}
