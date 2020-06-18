using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace ClientServer.Hubs
{
	public class HelpdeskHub : Hub
	{
		private static readonly List<string> ConnectedClients = new List<string>();

		public async Task SendMessage(string user, string message)
		{
			await Clients.Groups("HelpdeskClients").SendAsync("ReceiveMessage", Context.ConnectionId, message);
			await Clients.Caller.SendAsync("ReceiveMessage", user, message);
		}

		public async Task SendHelpdeskMessage(string connectionId, string user, string message)
		{
			await Clients.Groups(connectionId, "HelpdeskClients").SendAsync("ReceiveMessage", user, message);
		}

		public async Task RegisterWebClient()
		{
			ConnectedClients.Add(Context.ConnectionId);
			await Groups.AddToGroupAsync(Context.ConnectionId, Context.ConnectionId);
			await Clients.Groups("HelpdeskClients").SendAsync("ClientListUpdate", ConnectedClients);
			await Clients.Caller.SendAsync("ReceiveMessage", "Helpdesk", "Hello, how can I help you?");
		}

		public async Task RegisterHelpdeskClient()
		{
			await Groups.AddToGroupAsync(Context.ConnectionId, "HelpdeskClients");
			await Clients.Caller.SendAsync("ClientListUpdate", ConnectedClients);
		}

		public override async Task OnDisconnectedAsync(Exception exception)
		{
			if (ConnectedClients.Contains(Context.ConnectionId))
			{
				ConnectedClients.Remove(Context.ConnectionId);
				await Clients.Groups("HelpdeskClients").SendAsync("ClientListUpdate", ConnectedClients);
			}
			await base.OnDisconnectedAsync(exception);
		}
	}
}
